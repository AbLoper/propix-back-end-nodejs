// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// ⚙️ دالة عامة لإنشاء rate limiter قابل لإعادة الاستخدام
const createRateLimiter = ({ windowMinutes = 15, maxAttempts = 5, message }) => {
    return rateLimit({
        windowMs: windowMinutes * 60 * 1000,
        max: maxAttempts,
        standardHeaders: true,   // يُرسل معلومات الـ rate limit في headers
        legacyHeaders: false,    // إلغاء headers القديمة (X-RateLimit)
        message: {
            status: 'error',
            message,
        },
    });
};

// 🔒 حماية على التسجيل
const registerLimiter = createRateLimiter({
    windowMinutes: 15,
    maxAttempts: 5,
    message: 'Too many registration attempts. Please try again after 15 minutes.',
});

// 🔐 حماية على تسجيل الدخول
const loginLimiter = createRateLimiter({
    windowMinutes: 15,
    maxAttempts: 5,
    message: 'Too many login attempts. Please try again after 15 minutes.',
});

// 🛡️ حماية على تحديث الملف الشخصي
const updateProfileLimiter = createRateLimiter({
    windowMinutes: 10,
    maxAttempts: 3,
    message: 'Too many attempts to update profile. Please try again after 10 minutes.',
});

// تصدير الميدل وير
module.exports = {
    registerLimiter,
    loginLimiter,
    updateProfileLimiter
};
