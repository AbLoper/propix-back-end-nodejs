// استيراد الحزم الأساسية أولاً
const express = require('express');
const cors = require('cors');
const session = require('express-session');

// استيراد إعدادات CORS
const corsOptions = require('./config/corsOptions');

// استيراد إعدادات dotenv من الملف dotenvConfig
require('./config/dotenvConfig');

// استيراد الاتصال بقاعدة البيانات
require('./config/databaseConx');

// استدعاء cronJobs.js
require('./utils/prop/cronJobs');

// إعداد تطبيق Express
const app = express();

// استيراد ال middlewares
require('./middleware/index')(app);

// تطبيق إعدادات CORS على التطبيق
app.use(cors(corsOptions));

// استيراد إعدادات الـ Session
const sessionConfig = require('./config/sessionConfig');
// تطبيق إعدادات الجلسة على التطبيق
app.use(session(sessionConfig));

// مسار الـ API
app.use('/test', (req, res) => {
    res.send('API is working properly');
});

// استيراد المسارات
const userRouter = require('./routers/user/userRouter');
const propRouter = require('./routers/prop/propRouter');

// ربط المسارات بالموجهات
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

// الحصول على المنفذ من .env أو استخدام 5000 كبديل
const port = process.env.PORT || 5000;
if (!port) {
    console.error('PORT environment variable is missing!');
    process.exit(1);
}

// تشغيل الخادم على البورت المحدد
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
