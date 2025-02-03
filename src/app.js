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

// استيراد الاتصال بقاعدة البيانات
require('./mongoose/database'); // هذه هي الطريقة التي تقوم بها بربط ملف database.js

// استخدام Middlewares لتحسين الأمان وتنظيم التطبيق
const auth = require('./mongoose/middleware/auth');

// const userRoutes = require('./mongoose/routes/users');
// const taskRoutes = require('./mongoose/routes/tasks');

// ربط المسارات بالموجهات
// app.use(userRoutes);
// app.use(auth, taskRoutes);

// تمكين الـ JSON في الطلبات الواردة
app.use(express.json());

// تشغيل الخادم على البورت المحدد
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
