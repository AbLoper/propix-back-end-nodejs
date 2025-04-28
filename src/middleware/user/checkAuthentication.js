const jwt = require('jsonwebtoken');

const checkAuthentication = async (req, res, next) => {
    try {
        // الحصول على التوكن من الهيدر (Authorization)
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Authorization token is missing or malformed'
            });
        }

        const token = authHeader.split(' ')[1];

        // التحقق من صحة التوكن بشكل متزامن
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // بإمكانك إضافة بيانات المستخدم من التوكن إلى الطلب
        req.user = decoded;
        req.token = token;

        next(); // استدعاء التالي في السلسلة
    } catch (error) {
        const message = error.name === 'TokenExpiredError'
            ? 'Token has expired'
            : 'Invalid token';

        res.status(401).json({
            message,
            error: error.message
        });
    }
};

module.exports = checkAuthentication;
