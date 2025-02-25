const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User'); // نموذج المستخدم

// تمكين التحقق الثنائي للمستخدم
const enableTwoFactorAuth = async (req, res) => {
    const { userId } = req.user; // يجب أن تكون قد قمت بتوثيق المستخدم

    // إنشاء مفتاح سري للـ 2FA
    const secret = speakeasy.generateSecret({ name: 'MyApp' });

    // حفظ المفتاح السري في قاعدة البيانات
    const user = await User.findById(userId);
    user.twoFactorSecret = secret.base32;
    await user.save();

    // إنشاء رمز QR للمستخدم
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.status(200).json({ qrCodeUrl, message: 'تم تمكين التحقق الثنائي بنجاح.' });
};

// التحقق من رمز الـ 2FA أثناء تسجيل الدخول
const verifyTwoFactorAuth = async (req, res) => {
    const { token } = req.body;
    const { userId } = req.user;

    const user = await User.findById(userId);
    const secret = user.twoFactorSecret;

    const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
    });

    if (verified) {
        res.status(200).json({ message: 'تم التحقق بنجاح.' });
    } else {
        res.status(400).json({ message: 'رمز التحقق غير صالح.' });
    }
};
