const express = require('express');
const { register, verifyEmailOtp, resendEmailOtp } = require('../controllers/authController');

// Create a new router instance
const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/verify-otp', verifyEmailOtp);
router.post('/resend-otp', resendEmailOtp);

module.exports = router;
