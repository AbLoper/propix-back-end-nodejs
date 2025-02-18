// checkRole.js
const checkRole = (roles) => {
    return (req, res, next) => {
        // التحقق من أن المستخدم موجود في الـ request (من الـ JWT)
        if (!req.user) {
            return res.status(403).json({ message: 'Forbidden: User not authenticated.' });
        }

        // التحقق إذا كان دور المستخدم موجود في قائمة الأدوار المقبولة
        if (!roles.some(role => req.user.role === role)) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to access this resource.' });
        }

        next(); // إذا تم التحقق بنجاح، ننتقل إلى الـ Controller
    };
};

module.exports = checkRole; // تصدير الدالة بشكل مباشر
