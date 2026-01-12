const express = require('express');
const jsendMiddleware = require('./middlewares/jsendMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

const authRoute = require('./routes/authRoute'); // Import auth routes

app.use(express.json());  // Middleware to parse JSON request bodies
app.use(jsendMiddleware);  // Middleware to add JSend response methods


app.use('/api/auth', authRoute);

app.use(errorMiddleware); // Global error handling middleware

module.exports = app;