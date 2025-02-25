const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User'); // نموذج المستخدم

// إرسال رابط إعادة تعيين كلمة المرور
const sendResetPasswordEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-email-password',
        },
    });

    const resetPasswordUrl = `http://yourapp.com/reset-password?token=${token}`;

    const mailOptions = {
        from: 'your-email@gmail.com',
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

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ message: 'الرمز المميز غير صالح أو منتهي الصلاحية.' });
    }

    // تحديث كلمة المرور
    user.password = newPassword;  // تأكد من تشفير كلمة المرور باستخدام bcrypt أو مكتبة مشابهة
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.status(200).json({ message: 'تم تحديث كلمة المرور بنجاح.' });
};
