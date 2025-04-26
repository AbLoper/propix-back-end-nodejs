const session = require('express-session');

const sessionConfig = {
    secret: process.env.SESSION_SECRET_KEY || 'your_default_secret', // تخزين secret في متغير بيئة أو تعيين قيمة افتراضية
    resave: false,  // لا يتم حفظ الجلسة إذا لم تتغير
    saveUninitialized: false,  // لا تحفظ الجلسة إذا كانت غير مبدوءة من قبل المستخدم
    cookie: {
        secure: false, // التأكد من أن secure = true في بيئة الإنتاج فقط
        httpOnly: true,  // منع الوصول إلى الكوكيز عبر JavaScript، مما يزيد الأمان
        sameSite: 'Strict', // حماية ضد CSRF بتحديد SameSite كـ Strict
        maxAge: 1000 * 60 * 60 * 24 // تعيين مدة انتهاء الجلسة على 24 ساعة (بالمللي ثانية)
    },
    rolling: true // إعادة تعيين مدة انتهاء الجلسة مع كل طلب جديد (اختياري)
};

module.exports = sessionConfig;
