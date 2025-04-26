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

// استدعاء multer.js
require('./config/multerConfig');

// إعداد تطبيق Express
const app = express();

// استخدام مكتبة jsend لتوحيد الاستجابات
const jsend = require('jsend');

// استيراد ال middlewares
require('./middleware/index')(app);

// تطبيق إعدادات CORS على التطبيق
app.use(cors(corsOptions));

// استيراد إعدادات الـ Session
const sessionConfig = require('./config/sessionConfig');
// تطبيق إعدادات الجلسة على التطبيق
app.use(session(sessionConfig));

// استخدام jsend في استجابات الـ API
app.use((req, res, next) => {
    res.success = (data) => {
        return res.status(200).json(jsend.success(data));
    };

    res.error = (message, code = 400) => {
        return res.status(code).json(jsend.error(message));
    };

    res.fail = (message, code = 400) => {
        return res.status(code).json(jsend.fail(message));
    };

    next();
});

// مسار الـ API (مثال استخدام jsend في المسار)
app.use('/test', (req, res) => {
    res.success({ message: 'API is working properly' });
});

// استيراد المسارات
const userRouter = require('./routers/user/userRouter');
const propRouter = require('./routers/prop/propRouter');

// ربط المسارات بالموجهات
app.use('/api/users', userRouter); // ربط المسارات الخاصة بالمستخدمين
app.use('/api/properties', propRouter); // ربط المسارات الخاصة بالعقارات

// مسار لجميع الصفحات غير موجودة
app.use('*', (req, res) => {
    res.error('Page Not Found', 404);
});

// التعامل مع الأخطاء العامة
app.use((err, req, res, next) => {
    console.error('Unexpected Error:', err);
    res.error('Something went wrong!', 500);
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