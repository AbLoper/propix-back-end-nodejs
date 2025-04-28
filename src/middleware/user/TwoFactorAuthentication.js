const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User'); // نموذج المستخدم
const jsend = require('jsend');

// تمكين التحقق الثنائي للمستخدم
const enableTwoFactorAuth = async (req, res) => {
    const { userId } = req.user; // يجب أن تكون قد قمت بتوثيق المستخدم

    try {
        // إنشاء مفتاح سري للـ 2FA
        const secret = speakeasy.generateSecret({ name: 'MyApp' });

        // العثور على المستخدم في قاعدة البيانات
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json(jsend.error({ message: 'المستخدم غير موجود' }));
        }

        // حفظ المفتاح السري في قاعدة البيانات
        user.twoFactorSecret = secret.base32;
        await user.save();

        // إنشاء رمز QR للمستخدم
        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

        // إرجاع استجابة نجاح باستخدام jsend
        return res.status(200).json(jsend.success({ qrCodeUrl, message: 'تم تمكين التحقق الثنائي بنجاح.' }));
    } catch (error) {
        console.error('Error enabling 2FA:', error);
        return res.status(500).json(jsend.error({ message: 'حدث خطأ أثناء تمكين التحقق الثنائي.', error: error.message }));
    }
};

// التحقق من رمز الـ 2FA أثناء تسجيل الدخول
const verifyTwoFactorAuth = async (req, res) => {
    const { token } = req.body;
    const { userId } = req.user;

    try {
        // العثور على المستخدم في قاعدة البيانات
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json(jsend.error({ message: 'المستخدم غير موجود' }));
        }

        // استرجاع المفتاح السري للمستخدم
        const secret = user.twoFactorSecret;

        // التحقق من صحة رمز التحقق باستخدام speakeasy
        const verified = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
        });

        if (verified) {
            return res.status(200).json(jsend.success({ message: 'تم التحقق بنجاح.' }));
        } else {
            return res.status(400).json(jsend.error({ message: 'رمز التحقق غير صالح.' }));
        }
    } catch (error) {
        console.error('Error verifying 2FA token:', error);
        return res.status(500).json(jsend.error({ message: 'حدث خطأ أثناء التحقق من رمز الـ 2FA.', error: error.message }));
    }
};

module.exports = {
    enableTwoFactorAuth,
    verifyTwoFactorAuth
};
