const jsend = require('jsend');
const jwt = require('jsonwebtoken');  // استيراد مكتبة jwt للتحقق من التوكن

const checkRole = (roles) => {
    return (req, res, next) => {
        try {
            // الحصول على التوكن من الـ Authorization header
            const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // استخراج التوكن بعد "Bearer"
            // console.log('token stored in header is: ', token)

            // إذا لم يكن هناك توكن
            if (!token) {
                return res.status(401).json(jsend.error({
                    message: 'Unauthorized: Token not provided.'
                }));
            }

            // التحقق من صحة التوكن
            jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
                if (err) {
                    return res.status(401).json(jsend.error({
                        message: 'Unauthorized: Invalid or expired token.',
                        error: err.message
                    }));
                }

                // تعيين بيانات المستخدم المستخرجة من التوكن
                req.user = decoded;

                // التحقق من وجود الدور في التوكن
                if (!req.user || !req.user.role) {
                    return res.status(401).json(jsend.error({
                        message: 'Unauthorized: Role not found in token.'
                    }));
                }

                // console.log('User role:', req.user.role);  // طباعة دور المستخدم

                // التحقق من إذا كان الدور ضمن الأدوار المسموح بها
                if (!roles.includes(req.user.role)) {
                    return res.status(403).json(jsend.error({
                        message: `Forbidden: You need one of these roles [${roles.join(', ')}] to access this resource.`
                    }));
                }

                next();  // السماح بالوصول إذا كانت الصلاحية متوافقة
            });
        } catch (error) {
            res.status(500).json(jsend.error({
                message: 'Server error while checking role',
                error: error.message
            }));
        }
    };
};

module.exports = checkRole;
