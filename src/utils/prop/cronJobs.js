const cron = require('node-cron');
const User = require('../../models/user/userModel');
const Prop = require('../../models/prop/propModel');
const jsend = require('jsend');

// تحديد مهمة إعادة نشر الإعلانات
cron.schedule('0 0 * * *', async () => {
    try {
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

        await Promise.all(updatePromises);
        console.log('تم تحديث الإعلانات المنتهية');
    } catch (err) {
        console.error('حدث خطأ في جدولة إعادة نشر الإعلانات:', err);
        return jsend.error({ message: 'حدث خطأ في جدولة إعادة نشر الإعلانات', error: err.message });
    }
});

// إلغاء التوكنات القديمة بعد مرور ساعة
cron.schedule('*/5 * * * *', async () => {
    try {
        const expiredUsers = await User.find({
            lastLogin: { $lt: new Date(Date.now() - 60 * 60 * 1000) }  // أكثر من ساعة
        });

        const bulkOps = expiredUsers.map(user => {
            // إلغاء التوكنات القديمة (إلغاء صلاحية التوكن)
            user.tokens = user.tokens.filter(token => token.expiresAt > new Date());  // الإبقاء على التوكنات الصالحة فقط

            // تحديث "lastLogin" إلى null
            user.lastLogin = null;

            return {
                updateOne: {
                    filter: { _id: user._id },
                    update: { $set: { tokens: user.tokens, lastLogin: null } }
                }
            };
        });

        if (bulkOps.length > 0) {
            await User.bulkWrite(bulkOps);
            console.log('تم تسجيل الخروج التلقائي للمستخدمين لمرور أكثر من ساعة على آخر تسجيل دخول.');
            return jsend.success({ message: 'تم تسجيل الخروج للمستخدمين التلقائي بنجاح' });
        } else {
            return jsend.success({ message: 'لا توجد مستخدمين يحتاجون لتسجيل الخروج' });
        }
    } catch (err) {
        console.error('حدث خطأ في جدولة تسجيل الخروج التلقائي للمستخدمين:', err);
        return jsend.error({ message: 'حدث خطأ في جدولة تسجيل الخروج التلقائي للمستخدمين', error: err.message });
    }
});

// حذف التوكنات المنتهية صلاحيتها كل ساعة
cron.schedule('0 * * * *', async () => {  // كل ساعة
    const currentTime = new Date();

    const expiredTokens = await User.find({
        'tokens.expiresAt': { $lt: currentTime }
    });

    const bulkOps = expiredTokens.map(user => {
        // إبقاء التوكنات الصالحة فقط
        user.tokens = user.tokens.filter(token => token.expiresAt > currentTime);

        return {
            updateOne: {
                filter: { _id: user._id },
                update: { $set: { tokens: user.tokens } }
            }
        };
    });

    if (bulkOps.length > 0) {
        await User.bulkWrite(bulkOps);
        console.log('تم تحديث التوكنات المنتهية صلاحيتها');
        return jsend.success({ message: 'تم حذف التوكنات المنتهية صلاحيتها بنجاح' });
    } else {
        return jsend.success({ message: 'لا توجد توكنات منتهية صلاحيتها' });
    }
});