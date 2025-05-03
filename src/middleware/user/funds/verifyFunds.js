const User = require('../../../models/user/userModel');

const verifyFunds = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'المستخدم غير موجود' });
        }

        const amount = Number(req.body?.financial?.price?.amount);
        console.log("Received amount: ", amount);

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: 'قيمة السعر غير صحيحة أو مفقودة' });
        }

        if (user.funds < amount) {
            return res.status(400).json({ message: 'الرصيد غير كافٍ' });
        }
        console.log("User funds: ", user.funds);

        // تخزين المستخدم في الطلب للعمليات القادمة
        req.currentUser = user;
        // console.log('req.currentUser is: ', req.currentUser)

        next();
    } catch (error) {
        console.error('خطأ أثناء التحقق من الرصيد:', error.message);
        return res.status(500).json({
            message: 'حدث خطأ أثناء التحقق من الرصيد',
            error: error.message
        });
    }
};

module.exports = verifyFunds;
