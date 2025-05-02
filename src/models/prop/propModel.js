const { default: mongoose } = require('mongoose');
const moment = require('moment');

const propSchema = new mongoose.Schema(
    {
        // 1. معلومات أساسية عن العقار
        propType: { type: String, required: true },
        transactionType: {
            type: String,
            enum: ['rent', 'sale', 'investment'],
            required: true,
        },
        address: {
            city: { type: String, required: true },
            area: { type: String, required: true },
            street: { type: String, required: true },
            building: { type: Number, required: true },
            floor: { type: Number, required: true },
            apartment: { type: Number },
        },

        // 2. المواصفات الأساسية
        specification: {
            rooms: { type: Number, required: true },
            area: { type: Number },
            floor: { type: Number, required: true },
            bathroom: { type: Number, required: true },
            balcony: { type: Number, required: true },
            maidsRoom: { type: Number },
            design: {
                type: String,
                enum: ['Duplex', 'FullDuplex'],
            },
        },

        // 3. الميزات الإضافية
        features: {
            parking: { type: Boolean, default: false },
            elevator: { type: Boolean, default: false },
            heating: { type: Boolean, default: false },
            cooling: { type: Boolean, default: false },
            furniture: { type: Boolean, default: false },
            garden: { type: Boolean, default: false },
            security: { type: Boolean, default: false },
            waterwell: { type: Boolean, default: false },
            concierge: { type: Boolean, default: false },
            solarSystem: { type: Boolean, default: false },
            generator: { type: Boolean, default: false },
            bright: { type: Boolean, default: false },
            pool: { type: Boolean, default: false },
            gym: { type: Boolean, default: false },
        },

        // 4. المعلومات المالية
        financial: {
            price: {
                amount: { type: Number, required: true, min: 10, max: 10000 },
                currency: {
                    type: String,
                    required: true,
                    default: 'USD',
                    enum: ['USD'],
                },
            },
            duration: {
                type: String,
                enum: ['يومي', 'أسبوعي', 'شهري', 'ربع سنوي', 'نصف سنوي', 'سنوي'],
                required: false,
            },
            fee: {
                type: Number,
                required: false, // لم يعد مطلوبًا من المستخدم
            },
            paymentMethod: {
                type: String,
                enum: ['funds', 'coupon'],
            },
        },

        // 5. التواريخ
        expirydate: {
            type: Date,
            default: () => moment().add(1, 'year').toDate(),
        },

        // 6. المستخدمين
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        disabledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // ✅ تم التعديل
        },
        lastPublishedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

        // 7. الحالة
        status: {
            type: String,
            enum: ['approved', 'disabled', 'waiting', 'rejected', 'expired'],
            default: 'waiting',
            index: true,
        },
        autoRepost: {
            type: Boolean,
            default: false,
            set: function (value) {
                if (this.expirydate && new Date(this.expirydate) <= Date.now()) return false;
                if (this.status === 'expired') return false;
                return value;
            },
        },

        // 8. المرفقات
        images: {
            type: [String],
            validate: {
                validator: (value) => {
                    return (
                        value.length >= 1 &&
                        value.length <= 5 &&
                        value.every((img) => img.match(/\.(jpeg|jpg|png)$/i))
                    );
                },
                message: 'يجب أن تحتوي المصفوفة على صورة واحدة على الأقل وألا تتجاوز 5 صور.',
            },
            required: true,
        },

        // 9. ملاحظات وإشعارات
        note: {
            type: String,
            maxlength: 100,
        },
        notifications: {
            type: [String],
            default: [],
        },

        // 10. إعلان مميز
        isFeatured: { type: Boolean, default: false },
    },
    { timestamps: true }
);

propSchema.pre('validate', function (next) {
    const price = this.financial?.price?.amount;
    if (!price) return next();

    if (this.transactionType === 'rent') {
        this.financial.fee = price * 0.05;
    } else if (this.transactionType === 'sale') {
        this.financial.fee = price * 0.01;
    } else {
        this.financial.fee = 0;
    }
    next();
});

// رسوم محسوبة افتراضيًا
propSchema.virtual('feeCalculated').get(function () {
    if (this.transactionType === 'rent') return this.financial.price.amount * 0.05;
    if (this.transactionType === 'sale') return this.financial.price.amount * 0.01;
    return 0;
});

const Prop = mongoose.model('Prop', propSchema);
module.exports = Prop;
