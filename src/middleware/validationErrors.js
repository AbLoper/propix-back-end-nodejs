const { validationResult } = require('express-validator');

// ميدلوير للتحقق من الأخطاء باستخدام express-validator
const validationErrors = (req, res, next) => {
    // استخدام validationResult للتحقق من الأخطاء في المدخلات
    const errors = validationResult(req);

    // في حال وجود أخطاء في المدخلات
    if (!errors.isEmpty()) {
        // إرجاع استجابة بخطأ مع الرسالة والأخطاء المفصلة
        return res.status(400).json({
            success: false,
            message: 'التحقق من البيانات فشل',
            errors: errors.array().map(err => ({
                param: err.param,
                msg: err.msg
            }))
        });
    }

    // إذا لم تكن هناك أخطاء، المتابعة إلى الدالة التالية
    next();
};

module.exports = { validationErrors };
