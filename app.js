// تحميل المتغيرات البيئية أولاً
const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) {
    console.error('Error loading .env file:', result.error);
    process.exit(1);  // إنهاء التطبيق إذا فشل تحميل ملف .env
} else {
    console.log('Loaded .env file successfully');
}

// الحصول على المنفذ من .env أو استخدام 5000 كبديل
const port = process.env.PORT;

if (!port) {
    console.error('PORT environment variable is missing!');
    process.exit(1);
}

// استيراد الاتصال بقاعدة البيانات
require('./database'); // ربط ملف database.js
// استدعاء cronJobs.js
require('./src/utils/prop/cronJobs');

// إنشاء تطبيق Express جديد
const express = require('express');
const app = express();

// تمكين CORS قبل باقي الميدلوير
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// إعداد الـ session
const session = require('express-session');
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
}));

// تمكين الـ JSON في الطلبات الواردة
app.use(express.json()); // تأكد من تمكين express.json() أولاً

// تمكين الوصول إلى الملفات المرفوعة
app.use('/uploads', express.static('uploads'));

// تمكين cookie-parser لتحليل ملفات تعريف الارتباط
const cookieParser = require('cookie-parser')
app.use(cookieParser())

// تمكين السجلات
const morgan = require('morgan');
app.use(morgan("dev"));

// مسار الـ API
app.use('/test', (req, res) => {
    res.send('API is working properly');
});

// استيراد المسارات
const userRouter = require('./src/routers/user/userRouter');
const propRouter = require('./src/routers/prop/propRouter');

// ربط المسارات بالموجهات
app.use(userRouter); // ربط المسارات الخاصة بالمستخدمين
app.use(propRouter); // ربط المسارات الخاصة بالعقارات

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