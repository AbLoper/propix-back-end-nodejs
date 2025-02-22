const jwt = require('jsonwebtoken');

const userAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', ''); // استخراج التوكن من الهيدر
        if (!token) {
            return res.status(401).json({ message: 'Authorization token is missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // التحقق من التوكن باستخدام الـ secret
        req.user = decoded;  // إضافة معلومات المستخدم إلى req.user
        req.token = token;   // إضافة التوكن إلى req.token
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = userAuth;
