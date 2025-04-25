// تحميل المتغيرات البيئية أولاً
/* const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) {
    console.error('Error loading .env file:', result.error);
    process.exit(1);  // إنهاء التطبيق إذا فشل تحميل ملف .env
} else {
    console.log('Loaded .env file successfully');
} */

// الحصول على المنفذ من .env أو استخدام 5000 كبديل
const port = process.env.PORT || 5000; // تعيين المنفذ الافتراضي إلى 5000 إذا لم يتم تحديده في .env

if (!port) {
    console.error('PORT environment variable is missing!');
    process.exit(1);
}

// استيراد الاتصال بقاعدة البيانات
require('./config/database'); // ربط ملف database.js
// استدعاء cronJobs.js
require('./utils/prop/cronJobs');

// إنشاء تطبيق Express جديد
const express = require('express');
const app = express();

// استيراد ال middlewares
require('./middleware/index')(app);

// تمكين الـ session middleware
/* const session = require('express-session');
app.use(session({
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
})); */

// مسار الـ API
app.use('/test', (req, res) => {
    res.send('API is working properly');
});

// استيراد المسارات
const userRouter = require('./routers/user/userRouter');
const propRouter = require('./routers/prop/propRouter');

// ربط المسارات بالموجهات
// app.use(userRouter); // ربط المسارات الخاصة بالمستخدمين
app.use('/api/users', userRouter); // ربط المسارات الخاصة بالمستخدمين
app.use('/api/properties', propRouter); // ربط المسارات الخاصة بالعقارات

// مسار لجميع الصفحات غير موجودة
app.use('*', (req, res) => {
    res.status(404).send('Page Not Found');
});

// التعامل مع الأخطاء العامة
app.use((err, req, res, next) => {
    console.error('Unexpected Error:', err);
    res.status(500).send('Something went wrong!');
});

// تشغيل الخادم على البورت المحدد
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});