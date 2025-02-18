// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// إعداد الحماية من الهجمات على التسجيل
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 5, // الحد الأقصى 5 محاولات في 15 دقيقة
    message: 'Too many registration attempts, please try again later.',
});

// إعداد الحماية من الهجمات على تسجيل الدخول
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 5, // الحد الأقصى 5 محاولات في 15 دقيقة
    message: 'Too many login attempts, please try again later.',
});

// تصدير الـ middleware
module.exports = {
    registerLimiter,
    loginLimiter
};
