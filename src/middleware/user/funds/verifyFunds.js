const User = require('../../../models/user/userModel');

const verifyFunds = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

        const { financial } = req.body;

        if (!financial?.price?.amount) {
            return res.status(400).json({ message: 'القيمة المالية غير مكتملة' });
        }

        const totalCost = financial.price.amount + (financial.fee || 0);

        if (user.funds < totalCost) {
            return res.status(400).json({ message: 'الرصيد غير كافٍ' });
        }

        req.currentUser = user;
        next();
    } catch (error) {
        return res.status(500).json({ message: 'خطأ أثناء التحقق من الرصيد', error: error.message });
    }
};

module.exports = verifyFunds;
