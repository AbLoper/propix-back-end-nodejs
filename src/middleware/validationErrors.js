const { validationResult } = require('express-validator');
const jsend = require('jsend');

// ميدلوير للتحقق من الأخطاء باستخدام express-validator
const validationErrors = (req, res, next) => {
    // استخدام validationResult للتحقق من الأخطاء في المدخلات
    const errors = validationResult(req);

    // في حال وجود أخطاء في المدخلات
    if (!errors.isEmpty()) {
        // إرجاع استجابة بخطأ باستخدام مكتبة jsend
        return res.status(400).json(

            jsend.error({
                // إضافة حالة الخطأ                
                message: 'Validation failed',
                errors: errors.array() // إرسال الأخطاء المتعددة
            })
        );
    }

    // إذا لم تكن هناك أخطاء، المتابعة إلى الدالة التالية
    next();
};

module.exports = { validationErrors };