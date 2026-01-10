const express = require('express');

const app = express();

app.use(express.json());  // Middleware to parse JSON request bodies

module.exports = app;