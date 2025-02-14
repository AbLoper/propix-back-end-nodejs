const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// تعريف هيكل البيانات (Schema)
const userSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 8,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    // إضافة حقل جديد مع قيمة افتراضية
    role: {
        type: String,
        default: 'user' // هذا الحقل سيحتوي على القيمة الافتراضية 'user'
    },
    balance: {
        type: Number,
        default: 10
    },
    // إضافة حقل تاريخ الإنشاء مع قيمة افتراضية
    createdAt: {
        type: Date,
        default: Date.now  // سيتم تعيين تاريخ 
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// تشفير كلمة المرور قبل حفظها في قاعدة البيانات
userSchema.pre('save', async function (next) {
    const user = this;

    // إذا كانت الكلمة المرور غير معدلة (أي لا تحتاج إلى تشفير جديد)، فلا حاجة للتشفير مرة أخرى
    if (!user.isModified('password')) {
        return next();
    }

    try {
        // توليد كلمة مرور مشفرة باستخدام bcrypt (مع 10 دورات)
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// إضافة دالة للتحقق من كلمة المرور عند تسجيل الدخول
userSchema.methods.isValidPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (err) {
        throw err;
    }
};

// إنشاء نموذج مستخدم باستخدام الـ Schema
const User = mongoose.model('User', userSchema);

// تصدير النموذج
module.exports = User;