const { validationResult } = require('express-validator');
const jsend = require('jsend');

// ميدلوير للتحقق من الأخطاء باستخدام express-validator
const validationErrors = (req, res, next) => {
    const errors = validationResult(req);

    // في حال وجود أخطاء في المدخلات
    if (!errors.isEmpty()) {
        return res.status(400).json(
            jsend.error({
                message: 'Validation failed',
                errors: errors.array() // إرسال الأخطاء المتعددة
            })
        );
    }

    // إذا لم تكن هناك أخطاء، المتابعة إلى الدالة التالية
    next();
};

module.exports = { validationErrors };
