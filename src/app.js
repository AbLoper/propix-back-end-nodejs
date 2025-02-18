// استيراد الاتصال بقاعدة البيانات
require('./database'); // هذه هي الطريقة التي تقوم بها بربط ملف database.js
// استدعاء cronJobs.js
require('./utils/prop/cronJobs');

// استيراد المكتبات
const express = require('express');
// إنشاء تطبيق Express جديد
const app = express();

// تحميل المتغيرات البيئية
const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) {
    console.error('Error loading .env file:', result.error);
} else {
    console.log('Loaded .env file successfully');
}
const port = process.env.PORT || 3000;

// استيراد المسارات
const userRouter = require('./routers/user/userRouter');
const propRouter = require('./routers/prop/propRouter');

// تمكين الـ JSON في الطلبات الواردة
app.use(express.json()); // تأكد من تمكين express.json() أولاً

// مسار المنزل
app.get('/', (req, res) => {
    res.send('hello from home');
});

// ربط المسارات بالموجهات
app.use('/users', userRouter); // ربط المسارات الخاصة بالمستخدمين
app.use('/props', propRouter); // ربط المسارات الخاصة بالمستخدمين

// مسار لجميع الصفحات غير موجودة
app.get('*', (req, res) => {
    res.status(404).send('Page Not Found');
});

// تشغيل الخادم على البورت المحدد
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
