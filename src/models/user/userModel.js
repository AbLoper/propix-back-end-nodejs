const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^[0-9]{8}$/.test(v);
            },
            message: props => `${props.value} رقم الموبايل غير صحيح`
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: props => `${props.value} ليس بريدًا إلكترونيًا صالحًا!`
        }
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(v);
            },
            message: 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، بما في ذلك حرف كبير، حرف صغير، رقم، ورمز خاص!'
        }
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'owner'],
        default: 'user',
    },
    funds: {
        type: Number,
        default: 0
    },
    coupon: {
        type: Number,
        default: 1
    },
    tokens: [{
        type: String
    }],
    followedprops: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Prop' }
    ],
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    loginAttemptsLimit: {
        type: Number,
        default: 3 // الحد الأقصى لمحاولات تسجيل الدخول الفاشلة 3
    },
    accountLocked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// دالة التشفير قبل الحفظ
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        console.error('Error hashing password: ', err);
        return next(err); // تمرير الخطأ للميدلوير
    }
});

// دالة للتحقق من صحة كلمة المرور
userSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// دالة لتحديث وقت آخر تسجيل دخول
userSchema.methods.updateLastLogin = async function () {
    this.lastLogin = new Date();
    this.failedLoginAttempts = 0;
    this.lockUntil = null;
    this.accountLocked = false;
    await this.save();
    console.log('تم تسجيل الدخول بنجاح!');
};

// دالة لزيادة عدد محاولات تسجيل الدخول الفاشلة
userSchema.methods.incrementFailedLoginAttempts = async function () {
    this.failedLoginAttempts += 1;
    if (this.failedLoginAttempts >= this.loginAttemptsLimit) {
        this.accountLocked = true;
        this.lockUntil = Date.now() + 5 * 60 * 1000; // قفل الحساب لمدة 5 دقائق
        console.log('Your account is locked due to multiple failed login attemps. Please try again within 5 minutes.');
    }
    await this.save();
};

// دالة للتحقق مما إذا كان الحساب مقفلًا
userSchema.methods.isAccountLocked = function () {
    if (this.accountLocked && this.lockUntil > Date.now()) {
        return jsend.error({ message: 'حسابك مقفل بسبب محاولات تسجيل الدخول الفاشلة. يرجى المحاولة بعد 5 دقائق.' });
    }
    return false;
};

// دالة لفك قفل الحساب
userSchema.methods.unlockAccount = async function () {
    if (this.lockUntil && this.lockUntil < Date.now()) {
        this.failedLoginAttempts = 0;
        this.lockUntil = null;
        this.accountLocked = false;
        await this.save();
        console.log('تم استعادة الحساب بنجاح!');
    }
};

const User = mongoose.model('User', userSchema);
module.exports = User;