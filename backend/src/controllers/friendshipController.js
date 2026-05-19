const asyncWrapper = require("../middlewares/asyncWrapper");
const {
    getSuggestedService,
    getRequestsService,
    sendRequestService,
    acceptRequestService,
    handleRequestActionService,
    getFriendsService,
    removeFriendService,
    blockUserService,
    unblockUserService,
    getBlockedListService
} = require("../services/friendshipService");
const ErrorHandler = require("../utils/errorHandler");


// get suggestions logic will go here
const getSuggestions = asyncWrapper(async (req, res, next) => {
    // Get the logged-in user's ID from the request object (set by auth middleware)
    const userId = req.user.id;
    const queryString = req.query;

    // Call the service to get friend suggestions for the user
    const suggestions = await getSuggestedService(userId, queryString);

    // If no suggestions found, return a message instead of an empty array
    if (suggestions.suggestedUsers.length === 0) {
        return res.success("No friend suggestions found", 200);
    } else {
        res.success(suggestions, 200);
    }
});

// get requests logic will go here
const getRequests = asyncWrapper(async (req, res, next) => {
    // Get the logged-in user's ID from the request object (set by auth middleware)
    const userId = req.user.id;
    const queryString = req.query;

    // Call the service to get friend requests for the user
    const requests = await getRequestsService(userId, "incoming", queryString);

    // If no requests found, return a message instead of an empty array
    if (requests.requests.length === 0) {
        return res.success("No friend requests found", 200);
    } else {
        res.success(requests, 200);
    }
});

// get sent requests logic will go here
const getSentRequests = asyncWrapper(async (req, res, next) => {
    // Get the logged-in user's ID from the request object (set by auth middleware)
    const userId = req.user.id;
    const queryString = req.query;

    // const sentRequests = await getSentRequestsService(userId);

    // Call the service to get sent friend requests for the user
    const sentRequests = await getRequestsService(userId, "sent", queryString);

    // If no sent requests found, return a message instead of an empty array
    if (sentRequests.requests.length === 0) {
        return res.success("No sent friend requests found", 200);
    } else {
        res.success(sentRequests, 200);
    }
});

// sendRequest logic will go here
const sendRequest = asyncWrapper(async (req, res, next) => {
    // Get the logged-in user's ID from the request object (set by auth middleware)
    const currentUserId = req.user.id;
    const { targetUserId } = req.body;

    // Validate targetUserId input
    if (!targetUserId) {
        throw new ErrorHandler("Target user ID is required", 400);
    }

    // Call the service to send a friend request from the current user to the target user
    const friendship = await sendRequestService(currentUserId, targetUserId);

    // Send success response
    res.success(friendship, 201);
});

// acceptRequest logic will go here
const acceptRequest = asyncWrapper(async (req, res, next) => {
    const currentUserId = req.user.id;
    const { targetUserId } = req.body;

    // Validate targetUserId input
    if (!targetUserId) {
        return next(new ErrorHandler("Target user ID is required", 400));
    }

    // Call the service to accept the friend request
    const friendship = await acceptRequestService(currentUserId, targetUserId);

    // Send success response
    res.success({ friendship, message: "Friend request accepted successfully" });
});

// cancelRequest logic will go here
const cancelRequest = asyncWrapper(async (req, res, next) => {
    const currentUserId = req.user.id;
    const { targetUserId } = req.body;

    // Validate targetUserId input
    if (!targetUserId) {
        return next(new ErrorHandler("Target user ID is required", 400));
    }

    // Call the service to cancel the friend request
    await handleRequestActionService(currentUserId, targetUserId, "cancel");

    // Send success response
    res.success({ message: "Friend request cancelled successfully" });
});

// rejectRequest logic will go here
const rejectRequest = asyncWrapper(async (req, res, next) => {
    const currentUserId = req.user.id;
    const { targetUserId } = req.body;

    // Validate targetUserId input
    if (!targetUserId) {
        return next(new ErrorHandler("Target user ID is required", 400));
    }

    // Call the service to reject the friend request
    await handleRequestActionService(currentUserId, targetUserId, "reject");

    // Send success response
    res.success({ message: "Friend request rejected successfully" });
});

// getFriends logic will go here
const getFriends = asyncWrapper(async (req, res, next) => {
    const userId = req.user.id;
    const queryString = req.query;

    // Call the service to get the list of friends for the user
    const friends = await getFriendsService(userId, queryString);

    // If no friends found, return a message instead of an empty array
    if (friends.friends.length === 0) {
        return res.success("No friends found", 200);
    } else {
        res.success(friends, 200);
    }
});

// removeFriend logic will go here
const removeFriend = asyncWrapper(async (req, res, next) => {
    const currentUserId = req.user.id;
    const { targetUserId } = req.body;

    // Validate targetUserId input
    if (!targetUserId) {
        return next(new ErrorHandler("Target user ID is required", 400));
    }

    // Call the service to remove the friend
    await removeFriendService(currentUserId, targetUserId);

    // Send success response
    res.success({ message: "Friend removed successfully" });
});

// blockUser logic will go here
const blockUser = asyncWrapper(async (req, res, next) => {
    const currentUserId = req.user.id;
    const { targetUserId } = req.body;

    // Validate targetUserId input
    if (!targetUserId) {
        return next(new ErrorHandler("Target user ID is required", 400));
    }

    // Call the service to block the user
    const friendship = await blockUserService(currentUserId, targetUserId);

    // Send success response
    res.success({ message: "User blocked successfully", friendship });
});

// unblockUser logic will go here
const unblockUser = asyncWrapper(async (req, res, next) => {
    const currentUserId = req.user.id;
    const { targetUserId } = req.body;

    // Validate targetUserId input
    if (!targetUserId) {
        return next(new ErrorHandler("Target user ID is required", 400));
    }

    // Call the service to unblock the user
    const friendship = await unblockUserService(currentUserId, targetUserId);

    // Send success response
    res.success({ message: "User unblocked successfully", friendship });
});

// getBlockedList logic will go here
const getBlockedList = asyncWrapper(async (req, res, next) => {
    const currentUserId = req.user.id;
    const queryString = req.query;

    // Call the service to get the list of blocked users for the current user
    const blockedList = await getBlockedListService(currentUserId, queryString);

    // Send success response
    if (blockedList.blockedUsers.length === 0) {
        return res.success("No blocked users found", 200);
    } else {
        res.success(blockedList, 200);
    }
});

module.exports = {
    getSuggestions,
    getRequests,
    getSentRequests,
    sendRequest,
    acceptRequest,
    cancelRequest,
    rejectRequest,
    getFriends,
    removeFriend,
    blockUser,
    unblockUser,
    getBlockedList
}