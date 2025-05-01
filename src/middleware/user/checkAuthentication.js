const jwt = require('jsonwebtoken');

const checkAuthentication = async (req, res, next) => {
    try {
        // الحصول على التوكن من الهيدر (Authorization)
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'التوكن المفقود أو بتنسيق غير صحيح'
            });
        }

        const token = authHeader.split(' ')[1];

        // التأكد من وجود المتغير البيئي
        if (!process.env.JWT_SECRET_KEY) {
            return res.status(500).json({
                success: false,
                message: 'مفتاح التوكن غير موجود في البيئة'
            });
        }

        // التحقق من صحة التوكن
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // إضافة بيانات المستخدم من التوكن إلى الطلب
        req.user = decoded;
        req.token = token;

        next(); // استدعاء التالي في السلسلة
    } catch (error) {
        const message = error.name === 'TokenExpiredError'
            ? 'انتهت صلاحية التوكن'
            : 'توكن غير صالح';

        res.status(401).json({
            success: false,
            message,
            error: error.message
        });
    }
};

module.exports = checkAuthentication;
