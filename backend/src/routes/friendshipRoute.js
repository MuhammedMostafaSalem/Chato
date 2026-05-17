const express = require('express');
const protectUser = require('../middlewares/authMiddleware');
const {
    getRequests,
    getSuggestions,
    sendRequest,
    acceptRequest,
    cancelRequest,
    rejectRequest,
    getSentRequests,
    getFriends,
    removeFriend,
    blockUser,
    unblockUser,
    getBlockedList
} = require('../controllers/friendshipController');

const router = express.Router();

// Route to get friend suggestions for the current user
router.get('/suggestions', protectUser, getSuggestions);

// Routes for managing friend requests
router
    .get('/requests', protectUser, getRequests)
    .post('/requests', protectUser, sendRequest)
    .get('/requests/sent', protectUser, getSentRequests)
    .patch('/requests/accept', protectUser, acceptRequest)
    .delete('/requests/cancel', protectUser, cancelRequest)
    .delete('/requests/reject', protectUser, rejectRequest);

// Routes for managing friends
router
    .get('/friends', protectUser, getFriends)
    .delete('/friends/remove', protectUser, removeFriend);

// Routes for blocking and unblocking users
router
    .post('/block', protectUser, blockUser)
    .post('/unblock', protectUser, unblockUser)
    .get('/block/list', protectUser, getBlockedList);

module.exports = router;