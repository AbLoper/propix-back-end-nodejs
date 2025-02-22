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

const morgan = require('morgan');
const cors = require('cors');
// استيراد المكتبات
const express = require('express');
// إنشاء تطبيق Express جديد
const app = express();
// الحصول على المنفذ من .env أو استخدام 3000 كبديل
const port = process.env.PORT || 3000;
// استيراد المسارات
const userRouter = require('./routers/user/userRouter');
const propRouter = require('./routers/prop/propRouter');
// تمكين الـ JSON في الطلبات الواردة
app.use(express.json()); // تأكد من تمكين express.json() أولاً
// app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"], credentials: true }));
app.use(morgan("dev"));
// app.use(cors({ origin: ["http://localhost:3000", "http://180.16.19.252:3000"], credentials: true }));
app.use(cors({ origin: [process.env.CORS_ORIGIN, process.env.CORS_ORIGIN2], credentials: true }));
// app.use(cors({ origin: "*" })); // السماح لجميع المصادر

// مسار المنزل
app.get('/', (req, res) => {
    res.json({ message: "hello from back-end" });
});

// ربط المسارات بالموجهات
app.use('/users', userRouter); // ربط المسارات الخاصة بالمستخدمين
app.use('/props', propRouter); // ربط المسارات الخاصة بالعقارات

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