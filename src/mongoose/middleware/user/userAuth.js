const jwt = require('jsonwebtoken');
const User = require('../../models/user/userModel');

const userAuth = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // استخراج التوكن من header

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId); // استخدام الـ userId المستخلص من التوكن

        if (!user || !user.tokens.includes(token)) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = user; // تمرير بيانات المستخدم إلى request
        req.token = token; // تمرير التوكن نفسه
        next(); // الانتقال إلى الراوت التالي
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = userAuth;
