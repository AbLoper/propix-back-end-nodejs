const cron = require('node-cron');
const Prop = require('../../models/prop/propModel');  // تأكد من مسار الـ model الخاص بك
const User = require('../../models/user/userModel');  // تأكد من مسار الـ model الخاص بك

// جدولة فحص الإعلانات كل يوم عند منتصف الليل
cron.schedule('0 0 * * *', async () => {
    try {
        // ابحث عن الإعلانات التي انتهت فترة صلاحيتها وتحتاج إلى إعادة تفعيل تلقائي
        const expiredProps = await Prop.find({
            expirydate: { $lt: new Date() },
            autoRenew: true,
            status: 'مفعل'
        });

        expiredProps.forEach(async (prop) => {
            // تحقق من رصيد المستخدم
            const user = await User.findById(prop.createdBy);
            if (user.balance >= prop.price) {
                // إعادة نشر الإعلان وتحديث تاريخ الانتهاء (إضافة 3 أشهر مثلاً)
                prop.expirydate = new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000); // 3 أشهر
                prop.status = 'مفعل';
                await user.save(); // خصم المبلغ من رصيد المستخدم
                await prop.save(); // حفظ التعديلات

                console.log(`تم إعادة نشر الإعلان: ${prop.id}`);
            } else {
                // إذا كان رصيد المستخدم غير كافٍ، تعطيل الإعلان
                prop.status = 'معطل';
                await prop.save();

                console.log(`تم تعطيل الإعلان: ${prop.id} بسبب نقص الرصيد`);
            }
        });
    } catch (err) {
        console.error('حدث خطأ في جدولة إعادة نشر الإعلانات:', err);
    }
});
