const User = require('../../../models/user/userModel');

const verifyCoupons = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'المستخدم غير موجود' });
        }

        const couponCount = user.coupons;

        if (typeof couponCount !== 'number' || couponCount < 1) {
            return res.status(400).json({ message: 'عدد الكوبونات غير كافٍ' });
        }

        // تخزين المستخدم في الطلب للعمليات القادمة
        req.currentUser = user;
        next();
    } catch (error) {
        console.error('خطأ أثناء التحقق من الكوبونات:', error.message);
        return res.status(500).json({
            message: 'حدث خطأ أثناء التحقق من الكوبونات',
            error: error.message
        });
    }
};

module.exports = verifyCoupons;
