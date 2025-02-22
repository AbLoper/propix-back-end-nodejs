const checkRole = (roles) => {
    return (req, res, next) => {
        console.log('req.user', req.user);  // تحقق من معلومات المستخدم
        console.log('req.user.role', req.user.role);  // تحقق من دور المستخدم
        
        try {
            // التحقق من وجود المستخدم في الطلب (JWT)
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
            }

            // التحقق مما إذا كان دور المستخدم من ضمن الأدوار المسموح بها
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    message: `Forbidden: You need one of these roles [${roles.join(', ')}] to access this resource.`
                });
            }

            next();  // السماح بالوصول إذا كان المستخدم لديه الصلاحية
        } catch (error) {
            res.status(500).json({ message: 'Server error while checking role', error: error.message });
        }
    };
};

module.exports = checkRole;
