const express = require('express');
const { getUserProfile } = require('../controllers/userController');
const protectUser = require('../middlewares/authMiddleware');

// Create a new router instance
const router = express.Router();

// User routes
router.get('/getMe', protectUser, getUserProfile);

module.exports = router;