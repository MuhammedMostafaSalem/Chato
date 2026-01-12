const express = require('express');
const { register } = require('../controllers/authController');

// Create a new router instance
const router = express.Router();

// Register route
router.post('/register', register);

module.exports = router;
