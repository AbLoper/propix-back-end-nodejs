const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

// إنشاء تطبيق Express جديد
const app = express();

// استيراد الاتصال بقاعدة البيانات
require('./database'); // هذه هي الطريقة التي تقوم بها بربط ملف database.js
// استدعاء cronJobs.js
require('./utils/prop/cronJobs');

// تحميل المتغيرات البيئية
const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) {
    console.error('Error loading .env file:', result.error);
    process.exit(1);  // إنهاء التطبيق إذا فشل تحميل ملف .env
} else {
    console.log('Loaded .env file successfully');
}

// الحصول على المنفذ من .env أو استخدام 5000 كبديل
const port = process.env.PORT || 5000;
if (!process.env.PORT) {
    console.error('PORT environment variable is missing!');
    process.exit(1);
}

// تمكين CORS قبل باقي الميدلوير
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
// app.use(cors({ origin: "*" })); // السماح لجميع المصادر
// app.use(cors())

// تمكين الـ JSON في الطلبات الواردة
app.use(express.json()); // تأكد من تمكين express.json() أولاً

// تمكين السجلات
app.use(morgan("dev"));

// مسار الـ API
app.use('/test', (req, res) => {
    res.send('API is working properly');
});

// تمكين الوصول إلى الملفات المرفوعة
app.use('/uploads', express.static('uploads'));

// استيراد المسارات
const userRouter = require('./routers/user/userRouter');
const propRouter = require('./routers/prop/propRouter');

// ربط المسارات بالموجهات
app.use(userRouter); // ربط المسارات الخاصة بالمستخدمين
app.use(propRouter); // ربط المسارات الخاصة بالعقارات

// تمكين الوصول إلى الملفات المرفوعة
app.use('/uploads', express.static('uploads'));

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
app.listen(port,
    '0.0.0.0', // تعني أن الخادم سيستمع لجميع الواجهات الشبكية، وليس فقط localhost أو 127.0.0.1.
    () => {
        console.log(`Server is running on port ${port}`);
    });
