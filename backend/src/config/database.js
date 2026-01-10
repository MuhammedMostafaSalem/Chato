const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Connect to MongoDB using the connection string from environment variables
        await mongoose.connect(process.env.MOGO_URI).then((data) => {
            console.log(`✅ MongoDB connected with server: ${data.connection.host}`.cyan.underline);
        });
    } catch (error) {
        // Log any connection errors
        console.error(`Error connecting to MongoDB: ${error.message}`.red);
        process.exit(1); // Exit process with failure
    }
}

module.exports = connectDB;