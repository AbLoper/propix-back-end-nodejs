const { validationResult } = require('express-validator');

// ميدلوير للتحقق من الأخطاء باستخدام express-validator
const validationErrors = (req, res, next) => {
    // استخدام validationResult للتحقق من الأخطاء في المدخلات
    const errors = validationResult(req);

    // في حال وجود أخطاء في المدخلات
    if (!errors.isEmpty()) {
        // إرجاع استجابة بخطأ باستخدام res.error بدلاً من jsend
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array() // إرسال الأخطاء المتعددة
        });
    }

    // إذا لم تكن هناك أخطاء، المتابعة إلى الدالة التالية
    next();
};

module.exports = { validationErrors };
