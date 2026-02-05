const express = require('express');
const {
    getUserProfile,
    updateProfile,
    deleteAvatar,
    updateAvatar
} = require('../controllers/userController');
const protectUser = require('../middlewares/authMiddleware');
const { validateUpdateProfile } = require('../utils/validator/profileValidator');
const createUploader = require('../middlewares/multerMiddleware');

// Create a new router instance
const router = express.Router();

// Location of user profile image upload
const uploadUser = createUploader('upload/users');

// User routes
router.get('/getMe', protectUser, getUserProfile);
router.patch(
    '/updateMe',
    protectUser,
    validateUpdateProfile,
    updateProfile
);
router.put(
    '/updateAvatar',
    protectUser,
    uploadUser.single('avatar'),
    updateAvatar
);
router.delete('/deleteAvatar', protectUser, deleteAvatar);

module.exports = router;