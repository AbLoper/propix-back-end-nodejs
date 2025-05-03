const { default: mongoose } = require('mongoose');
// استبدال moment بـ Date عادي لتقليل الاعتمادية
// const moment = require('moment');

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
            bathroom: { type: Number, required: true },
            balcony: { type: Number, required: true },
            maidsRoom: { type: Number },
            design: {
                type: String,
                enum: ['Duplex', 'FullDuplex'], // راجع المصطلح إن لزم
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
                amount: { type: Number, required: true },
                currency: {
                    type: String,
                    default: 'USD',
                    enum: ['USD'],
                    // removed required: true because default is set
                },
            },
            duration: {
                type: String,
                enum: ['يومي', 'أسبوعي', 'شهري', 'ربع سنوي', 'نصف سنوي', 'سنوي'],
                default: 'شهري',
            },
            fee: {
                type: Number,
                // سيتم حسابه تلقائيًا في pre('validate')
            },
            paymentMethod: {
                type: String,
                required: true,
                enum: ['funds', 'coupons'],
            },
        },

        // 5. التواريخ
        expirydate: {
            type: Date,
            default: () => new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        },

        // 6. المستخدمين
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
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
        },

        // 8. المرفقات
        images: {
            type: [String],
            validate: {
                validator: (value) => {
                    if (!Array.isArray(value)) return false;
                    return (
                        value.length >= 1 &&
                        value.length <= 5 &&
                        value.every((img) => /\.(jpe?g|png)$/i.test(img))
                    );
                },
                message: 'عدد الصور يجب أن يكون بين 1 و 5، ويجب أن تكون من نوع JPG أو PNG.',
            },
            required: true,
        },

        // 9. ملاحظات وإشعارات
        note: {
            type: String,
            maxlength: 100,
            required: false,
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

// المعالجة المسبقة قبل الحفظ
propSchema.pre('validate', function () {
    const price = this.financial?.price?.amount;

    if (price) {
        if (this.transactionType === 'rent') {
            this.financial.fee = price * 0.05;
        } else if (this.transactionType === 'sale') {
            this.financial.fee = price * 0.01;
        } else {
            this.financial.fee = 0;
        }
    }

    // التعامل مع autoRepost هنا بدلًا من setter
    const isExpired = this.status === 'expired';
    const isAfterExpiry = this.expirydate && new Date(this.expirydate) <= Date.now();
    if (isExpired || isAfterExpiry) {
        this.autoRepost = false;
    }

    // next();
});

// رسوم محسوبة افتراضيًا
propSchema.virtual('feeCalculated').get(function () {
    if (this.transactionType === 'rent') return this.financial.price.amount * 0.05;
    if (this.transactionType === 'sale') return this.financial.price.amount * 0.01;
    return 0;
});

const Prop = mongoose.model('Prop', propSchema);
module.exports = Prop;
