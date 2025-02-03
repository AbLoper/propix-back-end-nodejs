// استيراد المكتبات
const mongoose = require('mongoose');

// تحميل المتغيرات البيئية من ملف .env
const dotenv = require('dotenv');
dotenv.config();

// التأكد من وجود URL لقاعدة البيانات
const MONGODB_URL = process.env.MONGODB_URL;
if (!MONGODB_URL) {
    console.error("Error Connecting Database.. Check MongoDb_URL In .env File");
    process.exit(1);  // إنهاء التطبيق إذا لم يتم العثور على عنوان قاعدة البيانات
}

// ربط قاعدة البيانات باستخدام Mongoose
mongoose.connect(MONGODB_URL)
    .then(() => {
        console.log('Database connected successfully!');
    })
    .catch((error) => {
        console.error('Database connection failed:', error);
        process.exit(1);  // إنهاء التطبيق إذا فشل الاتصال بقاعدة البيانات
    });
