const jwt = require('jsonwebtoken');
const jsend = require('jsend');

const userAuth = async (req, res, next) => {
    try {
        // أولاً، البحث عن التوكن في الهيدر
        let token = req.header('Authorization')?.replace('Bearer ', '');

        // إذا لم نجد التوكن في الهيدر، نبحث في الكوكيز
        if (!token) {
            token = req.cookies.token; // التوكن قد يكون مخزن في الكوكيز
        }

        // إذا لم نجد التوكن في الكوكيز، نبحث في الـ localStorage
        if (!token && typeof window !== 'undefined') {
            // إذا كان خادم (server-side) لن يكون هناك window
            token = window.localStorage.getItem('token'); // التوكن قد يكون مخزن في localStorage
        }

        // إذا لم نجد التوكن في أي مكان، نرسل رسالة خطأ
        if (!token) {
            return res.status(401).json(jsend.error({ message: 'Authorization token is missing' }));
        }

        // التحقق من التوكن باستخدام الـ secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;  // إضافة معلومات المستخدم إلى req.user
        req.token = token;   // إضافة التوكن إلى req.token
        next();
    } catch (error) {
        res.status(401).json(jsend.error({ message: 'Invalid or expired token', error: error.message }));
    }
};

module.exports = userAuth;
