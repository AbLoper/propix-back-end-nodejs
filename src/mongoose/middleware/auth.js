// في ملف auth.js
const jwt = require('jsonwebtoken');
const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // استخراج التوكن
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        console.log("Decoded user data from token: ", decoded); // تحقق من البيانات المستخلصة من التوكن

        req.user = decoded;  // إضافة البيانات المستخلصة من التوكن إلى الـ request
        next();  // المضي قدمًا إلى الميدلوير التالي
    });
}

module.exports = auth;