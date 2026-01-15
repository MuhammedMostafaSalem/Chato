const express = require('express');
const {
    register,
    verifyAccountOtp,
    resendAccountOtp,
    login,
    refreshToken,
    forgotPassword,
    resetPassword,
    logout
} = require('../controllers/authController');
const { validateLogin, validateForgotPassword, validateResetPassword } = require('../utils/validator/authValidator');

// Create a new router instance
const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/verify-otp', verifyAccountOtp);
router.post('/resend-otp', resendAccountOtp);
router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.post('/logout', logout);

module.exports = router;
