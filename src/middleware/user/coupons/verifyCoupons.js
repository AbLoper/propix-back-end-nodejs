const User = require('../../../models/user/userModel');

const verifyCoupons = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

        if (!user.coupons || user.coupons < 1) {
            return res.status(400).json({ message: 'عدد الكوبونات غير كافٍ' });
        }

        req.currentUser = user;
        next();
    } catch (error) {
        return res.status(500).json({ message: 'خطأ أثناء التحقق من الكوبونات', error: error.message });
    }
};

module.exports = verifyCoupons;
