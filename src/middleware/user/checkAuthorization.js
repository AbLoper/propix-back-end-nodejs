const jsend = require('jsend');

const checkAuthorization = (allowedRoles = []) => {
    return (req, res, next) => {
        try {
            const user = req.user;

            // التحقق من وجود بيانات المستخدم
            if (!user || !user.role) {
                return res.status(401).json(jsend.error({
                    message: 'Unauthorized: User role is missing.'
                }));
            }

            // التحقق من السماح بالدور
            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json(jsend.error({
                    message: `Forbidden: Access requires one of the following roles: [${allowedRoles.join(', ')}]`
                }));
            }

            next(); // السماح بالوصول
        } catch (error) {
            res.status(500).json(jsend.error({
                message: 'Server error while checking role.',
                error: error.message
            }));
        }
    };
};

module.exports = checkAuthorization;


// مثال فقط للمشرفين
// router.get('/admin-only', userAuth, checkAuthentication(['admin']), adminController.doSomething);

// مثال للمشرفين والمستخدمين
// router.get('/dashboard', userAuth, checkAuthentication(['admin', 'user']), dashboardController.showDashboard);
