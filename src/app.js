// ====================
// 1. استيراد الحزم الأساسية
// ====================
const express = require('express');
const cors = require('cors');
const session = require('express-session');

// ====================
// 2. تحميل التهيئات (Configs) والوظائف الخلفية
// ====================
require('./config/dotenvConfig');          // تحميل متغيرات البيئة
require('./config/databaseConx');          // الاتصال بقاعدة البيانات
require('./config/multerConfig');          // إعداد رفع الملفات
require('./utils/prop/cronJobs');          // الوظائف المجدولة (Cron Jobs)

const corsOptions = require('./config/corsOptions');
const sessionConfig = require('./config/sessionConfig');

// ====================
// 3. إنشاء تطبيق Express
// ====================
const app = express();

// ====================
// 4. ميدل وير النظام الأساسي
// ====================
app.use(express.json());                   // لتحليل JSON من الطلبات
app.use(cors(corsOptions));                // إعداد CORS
app.use(session(sessionConfig));           // تفعيل جلسات المستخدمين

// ====================
// 5. ميدل وير مخصص
// ====================
const jsendMiddleware = require('./middleware/jsend'); // تنسيق الردود
app.use(jsendMiddleware);

require('./middleware/index')(app);        // ميدل وير مخصصة أخرى

// ====================
// 6. مسار اختبار (Test Route)
// ====================
app.get('/test', (req, res) => {
    res.success({ message: 'API is working properly' });
});

// ====================
// 7. المسارات الرئيسية (Routers)
// ====================
const userRouter = require('./routers/user/userRouter');
const propRouter = require('./routers/prop/propRouter');

app.use('/api/users', userRouter);         // مسارات المستخدمين
app.use('/api/properties', propRouter);    // مسارات العقارات

// ====================
// 8. التعامل مع المسارات غير المعروفة
// ====================
app.use('*', (req, res) => {
    res.error('Page Not Found', 404);
});

// ====================
// 9. ميدل وير التعامل مع الأخطاء
// ====================
app.use((err, req, res, next) => {
    console.error('Unexpected Error:', err);

    if (res.headersSent) return next(err);

    const isDev = process.env.NODE_ENV !== 'production';
    const message = isDev ? err.message : 'Something went wrong!';
    const stack = isDev ? err.stack : undefined;

    res.status(500).json({
        status: 'error',
        message,
        ...(stack && { stack })
    });
});

// ====================
// 10. تشغيل الخادم
// ====================
const port = process.env.PORT || 5000;

if (!port) {
    console.error('PORT environment variable is missing!');
    process.exit(1);
}

app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${port}`);
});
