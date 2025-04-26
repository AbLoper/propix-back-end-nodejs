const dotenv = require('dotenv');

// تحميل المتغيرات البيئية
const result = dotenv.config();
if (result.error) {
    console.error('Error loading .env file:', result.error);
    process.exit(1);  // إنهاء التطبيق إذا فشل تحميل ملف .env
} else {
    console.log('Loaded .env file successfully');
}

module.exports = dotenv; // يمكن تصدير dotenv إذا أردت استخدامه في مكان آخر
