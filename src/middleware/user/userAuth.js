const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    let token;

    // البحث عن التوكن في الهيدرات أو الجلسة
    token = req.header('Authorization')?.replace('Bearer ', '') ||
            req.header('x-auth-token') ||
            (req.session ? req.session.token : null);

    // التحقق مما إذا كان التوكن غير موجود
    if (!token) {
        return res.status(401).json({ msg: "Unauthorized: No token provided" });
    }

    // التحقق مما إذا كان متغير البيئة `JWT_SECRET` معرفًا
    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables");
        return res.status(500).json({ msg: "Internal server error" });
    }

    try {
        // فك تشفير التوكن والتحقق منه
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // إضافة بيانات المستخدم إلى الطلب
        req.user = decoded.user;

        // الانتقال إلى الميدلوير التالي
        next();
    } catch (err) {
        console.error("JWT verification error:", err.message);
        return res.status(401).json({ msg: "Unauthorized: Invalid token" });
    }
};

module.exports = verifyToken;
