const checkAuthorization = (allowedRoles = []) => {
    return (req, res, next) => {
        try {
            const user = req.user;

            // التحقق من وجود بيانات المستخدم
            if (!user || !user.role) {
                return res.status(401).json({
                    success: false,
                    message: 'غير مصرح: لا يوجد دور للمستخدم.'
                });
            }

            // التحقق من السماح بالدور
            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    success: false,
                    message: `ممنوع: الوصول يتطلب أحد الأدوار التالية: [${allowedRoles.join(', ')}]`
                });
            }

            next(); // السماح بالوصول
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'حدث خطأ في الخادم أثناء التحقق من الدور.',
                error: error.message
            });
        }
    };
};

module.exports = checkAuthorization;
