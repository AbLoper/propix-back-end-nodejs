const verifyCoupon = require("./coupon/verifyCoupon");
const verifyFunds = require("./funds/verifyFunds");

const checkPaymentMethod = (req, res, next) => {
    const paymentMethod = req.body?.financial?.paymentMethod;

    if (!paymentMethod) {
        return res.status(400).json({ message: 'يجب تحديد طريقة الدفع ضمن البيانات المالية' });
    }

    const validMethods = ['funds', 'coupon'];

    if (!validMethods.includes(paymentMethod)) {
        return res.status(400).json({ message: 'طريقة الدفع غير مدعومة. يجب أن تكون "funds" أو "coupon".' });
    }

    switch (paymentMethod) {
        case 'funds':
            return verifyFunds(req, res, next);
        case 'coupon':
            return verifyCoupon(req, res, next);
    }
};

module.exports = checkPaymentMethod;
