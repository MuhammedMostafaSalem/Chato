const http = require('http');
const dotenv = require('dotenv');

// 1. Load environment variables from .env file
dotenv.config({ path: './src/config/.env' });

// 2. Import the Express app
const app = require('./src/app');
const connectDB = require('./src/config/database');

// 3. Import colors package for colored console output
require('colors');


// Create HTTP server
const server = http.createServer(app);
// Define the port
const PORT = process.env.PORT || 3000;

// Ensure to connect to the database before starting the server
connectDB();

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`.green);
});