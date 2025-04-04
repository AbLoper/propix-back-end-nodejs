const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// dotenv.config();

const connectToDatabase = async () => {
    try {
        const mongoURI = process.env.DB_HOST;

        if (!mongoURI) {
            console.error('MONGO_URI is not defined in the environment variables');
            return;
        }

        // الاتصال بقاعدة البيانات بدون الخيارات القديمة
        await mongoose.connect(mongoURI);

        console.log('Database connection established successfully');
    } catch (error) {
        console.error('Database connection error:', error.message);
    }
};

connectToDatabase();
