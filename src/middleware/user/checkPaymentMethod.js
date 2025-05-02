const verifyCoupons = require("./coupons/verifyCoupons");
const verifyFunds = require("./funds/verifyFunds");

const checkPaymentMethod = (req, res, next) => {
    const paymentMethod = req.body?.financial?.paymentMethod;

    if (!paymentMethod) {
        return res.status(400).json({ message: 'يجب تحديد طريقة الدفع ضمن البيانات المالية' });
    }

    const validMethods = ['funds', 'coupons'];

    if (!validMethods.includes(paymentMethod)) {
        return res.status(400).json({ message: 'طريقة الدفع غير مدعومة. يجب أن تكون "funds" أو "coupons".' });
    }

    switch (paymentMethod) {
        case 'funds':
            return verifyFunds(req, res, next);
        case 'coupons':
            return verifyCoupons(req, res, next);
    }
};

module.exports = checkPaymentMethod;