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
            message: props => `${props.value} ليس رقم هاتف صالحًا!`
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
    balance: {
        type: Number,
        default: 10
    },
    tokens: [{ type: String }],
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
        default: null
    },
    loginAttemptsLimit: {
        type: Number,
        default: 5
    },
    accountLocked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

userSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.incrementFailedLoginAttempts = async function () {
    this.failedLoginAttempts += 1;
    if (this.failedLoginAttempts >= this.loginAttemptsLimit) {
        this.accountLocked = true;
    }
    await this.save();
};

userSchema.methods.updateLastLogin = async function () {
    this.lastLogin = new Date();
    this.failedLoginAttempts = 0;
    this.lockUntil = null;
    this.accountLocked = false;
    await this.save();
};

userSchema.methods.isAccountLocked = function () {
    return this.accountLocked || (this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.unlockAccount = async function () {
    if (this.lockUntil && this.lockUntil < Date.now()) {
        this.failedLoginAttempts = 0;
        this.lockUntil = null;
        this.accountLocked = false;
        await this.save();
    }
};

const User = mongoose.model('User', userSchema);
module.exports = User;
