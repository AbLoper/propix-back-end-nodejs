const checkAuthorization = (allowedRoles = []) => {
    return (req, res, next) => {
        try {
            const user = req.user;

            // التحقق من وجود بيانات المستخدم
            if (!user || !user.role) {
                return res.status(401).json({
                    message: 'Unauthorized: User role is missing.'
                });
            }

            // التحقق من السماح بالدور
            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    message: `Forbidden: Access requires one of the following roles: [${allowedRoles.join(', ')}]`
                });
            }

            next(); // السماح بالوصول
        } catch (error) {
            res.status(500).json({
                message: 'Server error while checking role.',
                error: error.message
            });
        }
    };
};

module.exports = checkAuthorization;
