const cron = require('node-cron');
const User = require('../../models/user/userModel');
const Prop = require('../../models/prop/propModel');
const jsend = require('jsend');

// تحديد المهمة باستخدام الجدولة الجديدة
cron.schedule('0 0 * * *', async () => {
    try {
        // البحث عن الإعلانات التي انتهت فترة صلاحيتها
        const expiredProps = await Prop.find({
            expirydate: { $lt: new Date() },
            autoRepost: true,
            status: 'active'
        });

        const updatePromises = expiredProps.map(async (prop) => {
            const user = await User.findById(prop.createdBy);
            if (!user) {
                console.log(`المستخدم مع ID ${prop.createdBy} غير موجود`);
                return;
            }

            // التحقق من رصيد المستخدم وإعادة تفعيل الإعلان
            if (user.balance >= prop.price.amount) {
                user.balance -= prop.price.amount;
                prop.expirydate = new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000);  // تمديد صلاحية الإعلان لثلاثة أشهر
                prop.status = 'active';

                await user.save();
                await prop.save();
                console.log(`تم إعادة نشر الإعلان: ${prop.adNumber}`);
            } else {
                prop.status = 'inactive';
                await prop.save();
                console.log(`تم تعطيل الإعلان: ${prop.adNumber} بسبب نقص الرصيد`);
            }
        });

        // انتظار الانتهاء من كافة التحديثات
        await Promise.all(updatePromises);
    } catch (err) {
        // استخدام jsend لإرجاع استجابة منسقة في حال حدوث خطأ
        console.error('حدث خطأ في جدولة إعادة نشر الإعلانات:', err);
        return res.status(500).json(jsend.error({ message: 'حدث خطأ في جدولة إعادة نشر الإعلانات', error: err }));
    }
});
