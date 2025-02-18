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
        enum: ['user', 'admin', 'owner'], // تحديد نوع المستخدم (إما مستخدم عادي أو مسؤول)
        default: 'user', // القيمة الافتراضية هي "مستخدم عادي"
    },
    balance: {
        type: Number,
        default: 10
    },
    tokens: [{ type: String }], // حقل للتوكنات المخزنة

    // الحقول الجديدة
    failedLoginAttempts: {
        type: Number,
        default: 0 // عدد المحاولات الفاشلة
    },
    lockUntil: {
        type: Date,
        default: null // الوقت الذي سيبقى فيه الحساب مغلقًا إذا كانت المحاولات الفاشلة أكثر من الحد
    },
    lastLogin: {
        type: Date,
        default: null // تخزين آخر وقت تم فيه تسجيل الدخول
    },
    // الحد الأقصى للمحاولات الفاشلة قبل القفل
    loginAttemptsLimit: {
        type: Number,
        default: 5 // الحد الأقصى للمحاولات الفاشلة (يمكن تغييره حسب الحاجة)
    },
    accountLocked: {
        type: Boolean,
        default: false // إذا كانت الحساب مقفلًا بسبب المحاولات الفاشلة
    }
},
    { timestamps: true } // ستضيف `createdAt` و `updatedAt` تلقائيًا
);

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

// تحديث الحقل failedLoginAttempts بعد محاولة تسجيل الدخول فاشلة
userSchema.methods.incrementFailedLoginAttempts = async function () {
    this.failedLoginAttempts += 1;

    // إذا وصل عدد المحاولات الفاشلة إلى الحد الأقصى، يتم قفل الحساب بشكل دائم
    if (this.failedLoginAttempts >= this.loginAttemptsLimit) {
        this.accountLocked = true;
    }

    await this.save();
};

// تحديث الحقل lastLogin عند تسجيل الدخول بنجاح
userSchema.methods.updateLastLogin = async function () {
    this.lastLogin = new Date();
    this.failedLoginAttempts = 0; // إعادة تعيين المحاولات الفاشلة بعد تسجيل الدخول الناجح
    this.lockUntil = null; // إعادة تعيين حالة القفل
    this.accountLocked = false; // إعادة تعيين القفل الدائم
    await this.save();
};

// إنشاء نموذج مستخدم باستخدام الـ Schema
const User = mongoose.model('User', userSchema);

// تصدير النموذج
module.exports = User;
