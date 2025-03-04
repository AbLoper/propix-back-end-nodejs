const { default: mongoose } = require("mongoose");

const propSchema = new mongoose.Schema(
    {
        // 1. معلومات أساسية عن العقار
        propType: {
            type: String,
            required: true,
        },

        address: {
            city: { type: String, required: true },
            area: { type: String, required: true },
            street: { type: String, required: true },
            building: { type: Number, required: true },
            floor: { type: Number, required: true },
            apartment: { type: Number, required: true },
        },

        // 2. معلومات عن السعر
        price: {
            amount: { type: Number, required: true },
            currency: { type: String, required: true, default: 'USD' },
        },

        // 3. المواصفات الأساسية
        specification: {
            rooms: { type: Number, required: true },
            area: { type: Number },
            floor: { type: Number, required: true },
            bathroom: { type: Number, required: true },
            balcony: { type: Number, required: true },
            maidsRoom: { type: Number },
            design: { type: String, enum: ['Duplex', 'FullDuplex'] },
        },

        // 4. الميزات الإضافية
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

        // 5. المعلومات المالية (إيجار، بيع، استثمار)
        financial: {
            rent: {
                duration: { type: String, enum: ['يومي', 'أسبوعي', 'شهري', 'ربع سنوي', 'نصف سنوي', 'سنوي'], required: true },
                period: { type: Number, required: true },
                price: { type: Number },
                cost: { type: Number, default: 0 },
            },
            sale: {
                price: { type: Number },
            },
            investment: {
                duration: { type: String, enum: ['يومي', 'أسبوعي', 'شهري', 'ربع سنوي', 'نصف سنوي', 'سنوي'], required: true },
                period: { type: Number, required: true },
                price: { type: Number },
                cost: { type: Number, default: 0 },
            },
            requiredFinancialField: {
                type: String,
                validate: {
                    validator: function () {
                        return (
                            this.financial.rent.price ||
                            this.financial.sale.price ||
                            this.financial.investment.price
                        );
                    },
                    message: '.يجب تحديد أحد الخيارات: الإيجار أو البيع أو الاستثمار مع تحديد السعر',
                },
            },
            fee: {
                type: Number,
                default: function () {
                    // حساب الرسوم بناءً على السعر (10% من السعر)
                    return this.price.amount * 0.10;
                },
            },
        },

        // 6. التواريخ
        expirydate: {
            type: Date,
            default: function () {
                // تحديد فترة صلاحية بناءً على نوع المعاملة المالية (بيع، إيجار، استثمار)
                if (this.financial.rent && this.financial.rent.duration) {
                    switch (this.financial.rent.duration) {
                        case 'يومي':
                            return new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);  // يوم
                        case 'أسبوعي':
                            return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);  // أسبوع
                        case 'شهري':
                            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // شهر
                        default:
                            return new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000);  // 3 أشهر كإفتراضي
                    }
                }
                return new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000); // 3 أشهر كإفتراضي
            }
        },
        activatedAt: { type: Date },
        disabledAt: { type: Date },
        lastPublishedAt: { type: Date },

        // 7. حالة الإعلان
        status: { type: String, enum: ['active', 'inactive', 'waiting', 'rejected', 'expired'], default: 'waiting' },
        autoRepost: { type: Boolean, default: false },

        // 8. من قام بإجراء التعديلات
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        disabledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

        // 9. المرفقات والملفات
        images: {
            type: [String],
            validate: {
                validator: (value) => {
                    return value.length <= 5 && value.every(img => img.match(/\.(jpeg|jpg|png)$/));
                },
                message: 'يجب أن تكون الصور بصيغة JPEG أو PNG وألا تتجاوز 5 صور.',
            },
        },

        notifications: [{
            type: String,
            message: String,
            date: { type: Date, default: Date.now },
        }],
        notes: { type: String },

        // 10. المفضلة والاتصالات
        favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        adNumber: { type: String, unique: true, required: true },
        isFeatured: { type: Boolean, default: false },  // الحقل الجديد هنا

        approved: {
            type: Boolean,
            default: false, // يعكس الحالة المبدئية للإعلان
        },
    },
    { timestamps: true }
);

// إنشاء نموذج مستخدم باستخدام الـ Schema
const Prop = mongoose.model('Prop', propSchema);

// تصدير النموذج
module.exports = Prop;