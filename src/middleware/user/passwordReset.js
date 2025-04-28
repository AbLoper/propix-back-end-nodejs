const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // نموذج المستخدم
require('dotenv').config(); // تحميل المتغيرات البيئية من ملف .env

// إرسال رابط إعادة تعيين كلمة المرور
const sendResetPasswordEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // استخدام المتغير البيئي
            pass: process.env.EMAIL_PASS, // استخدام المتغير البيئي
        },
    });

    const resetPasswordUrl = `http://yourapp.com/reset-password?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER, // استخدام المتغير البيئي
        to: email,
        subject: 'إعادة تعيين كلمة المرور',
        text: `اضغط على الرابط التالي لإعادة تعيين كلمة المرور: ${resetPasswordUrl}`,
    };

    await transporter.sendMail(mailOptions);
};

// إنشاء رمز مميز وإرسال رابط إعادة تعيين كلمة المرور
const initiatePasswordReset = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // إنشاء رمز مميز
    const token = crypto.randomBytes(20).toString('hex');
    const expirationTime = Date.now() + 3600000; // صلاحية الرمز لمدة ساعة

    // تخزين الرمز المميز ووقت انتهاء الصلاحية في قاعدة البيانات
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expirationTime;
    await user.save();

    // إرسال البريد الإلكتروني للمستخدم
    await sendResetPasswordEmail(email, token);

    res.status(200).json({ message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.' });
};

// إعادة تعيين كلمة المرور بعد التحقق من الرمز المميز
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    // التحقق من وجود الرمز المميز في قاعدة البيانات وصلاحيته
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }, // تحقق من أن الرمز لم ينتهِ
    });

    if (!user) {
        return res.status(400).json({ message: 'الرمز المميز غير صالح أو منتهي الصلاحية.' });
    }

    // تشفير كلمة المرور الجديدة
    const salt = await bcrypt.genSalt(10); // إعداد السالسيور
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // تحديث كلمة المرور في قاعدة البيانات
    user.password = hashedPassword;
    user.resetPasswordToken = undefined; // إزالة الرمز المميز بعد استخدامه
    user.resetPasswordExpires = undefined; // إزالة وقت انتهاء الصلاحية

    await user.save();
    res.status(200).json({ message: 'تم تحديث كلمة المرور بنجاح.' });
};

module.exports = {
    initiatePasswordReset,
    resetPassword
};
