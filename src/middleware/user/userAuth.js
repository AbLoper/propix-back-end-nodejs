const jwt = require('jsonwebtoken');

// التحقق من وجود التوكن في الهيدر أو في الجلسة
const verifyToken = async (req, res, next) => {
    let token;

    // 1. البحث عن التوكن في Authorization Header
    token = req.header('Authorization')?.replace('Bearer ', '');
    
    // 2. إذا لم نجد التوكن في Authorization، نبحث في x-auth-token Header
    if (!token) {
        token = req.header('x-auth-token');
    }

    // 3. إذا لم نجد التوكن في الهيدرات، نبحث في الجلسة (إذا كان هناك session موجودة)
    if (!token && req.session && req.session.token) {
        token = req.session.token;
    }

    // 4. إذا لم نجد التوكن في أي مكان، نرسل رسالة خطأ
    if (!token) {
        return res.status(401).json({ msg: "No authentication token, authorization denied" });
    }

    try {
        // التحقق من التوكن باستخدام secret من environment variables
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ msg: "JWT secret is not defined in the environment variables" });
        }

        // فك التوكن والتحقق منه
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        // إضافة البيانات المفككة إلى الطلب (req.user) حتى يمكن استخدامها في باقي الميدلويرز أو المسارات
        req.user = decoded.user;
        
        // الانتقال إلى الميدلوير التالي
        next();
    } catch (err) {
        console.error("JWT verification error:", err);
        res.status(401).json({ msg: "Token is not valid" });
    }
};

module.exports = verifyToken;
