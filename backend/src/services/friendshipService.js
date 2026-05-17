const Friendship = require("../models/friendshipModel");
const User = require("../models/userModels");
const ErrorHandler = require("../utils/errorHandler");



// Service to get friend suggestions for a user
const getSuggestedService = async (currentUserId) => {
    // Find all friendships involving the current user
    const friendships = await Friendship.find({
        $or: [
            { requester: currentUserId },
            { recipient: currentUserId },
        ],
    });

    // Create a set of user IDs to exclude from suggestions (current friends and pending requests)
    const excludedUserIds = new Set();

    // Add friends and pending requests to the exclusion set
    friendships.forEach(friendship => {
        if (friendship.requester.toString() === currentUserId) {
            excludedUserIds.add(friendship.recipient.toString());
        } else {
            excludedUserIds.add(friendship.requester.toString());
        }
    });

    // also exclude the current user themselves
    excludedUserIds.add(currentUserId);

    // Find users who are not in the excluded set and return them as suggestions
    const suggestedUsers = await User.find({
        _id: { $nin: Array.from(excludedUserIds) },
    }).select("username phoneNumber email avatar");

    return suggestedUsers;
}

// Service to get friend requests for a user (both incoming and sent)
const getRequestsService = async (userId, type) => {
    // Build the query filter based on the request type (incoming or sent)
    const filter = {
        status: "pending",
    };

    // For incoming requests, we want to find friendships where the user is the recipient
    // For sent requests, we want to find friendships where the user is the requester
    if (type === "incoming") {
        filter.recipient = userId;
    } else if (type === "sent") {
        filter.requester = userId;
    } else {
        throw new ErrorHandler("Invalid request type", 400);
    }

    // Determine which field to populate based on the request type
    const populateField = type === "incoming" ? "requester" : "recipient";

    // Execute the query to find friend requests and populate the relevant user information
    const requests = await Friendship.find(filter)
        .populate(populateField, "username phoneNumber email avatar")
        .sort({ createdAt: -1 });

    return requests;
}

// Service to send a friend request
const sendRequestService = async (currentUserId, targetUserId) => {
    // Prevent users from sending friend requests to themselves
    if (currentUserId === targetUserId) {
        throw new ErrorHandler("You cannot send a friend request to yourself", 400);
    }

    // Check if the target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
        throw new ErrorHandler("User not found", 404);
    }

    // Check if a friendship already exists (in either direction)
    let requester = currentUserId;
    let recipient = targetUserId;

    // Order requester and recipient IDs to ensure uniqueness regardless of direction
    if (requester > recipient) {
        [requester, recipient] = [recipient, requester];
    }

    // Check if there is a blocked relationship between the users in either direction
    const blockedRelationship = await Friendship.findOne({
        requester,
        recipient,
        isBlocked: true,
    });
    if (blockedRelationship) {
        throw new ErrorHandler("You cannot send a friend request to this blocked user", 403);
    }

    // Check for existing friendship
    const existingFriendship = await Friendship.findOne({
        requester,
        recipient,
    });

    // Handle existing friendship cases
    if (existingFriendship) {
        if (existingFriendship.status === "pending") {
            throw new ErrorHandler("Friend request already sent", 409);
        }
        if (existingFriendship.status === "accepted") {
            throw new ErrorHandler("You are already friends", 409);
        }
        if (existingFriendship.isBlocked) {
            throw new ErrorHandler("You cannot send a friend request to this blocked user", 403);
        }
    }

    // Create a new friend request
    const friendship = await Friendship.create({
        requester,
        recipient,
        status: "pending",
    });

    return friendship;
}

// Service to accept a friend request
const acceptRequestService = async (currentUserId, targetUserId) => {
    // Prevent users from accepting friend requests from themselves
    if (currentUserId === targetUserId) {
        throw new ErrorHandler("You cannot accept a friend request from yourself", 400);
    }

    // Check if the target user already exists
    let requester = currentUserId;
    let recipient = targetUserId;

    // Order requester and recipient IDs to ensure uniqueness regardless of direction
    if (requester > recipient) {
        [requester, recipient] = [recipient, requester];
    }

    // Check if a friendship already exists
    const friendship = await Friendship.findOne({
        requester,
        recipient,
    });

    // Check if no friendship found
    if (!friendship) {
        throw new ErrorHandler("Friend request not found", 404);
    }

    // Check if the friendship is still pending
    if (friendship.status !== "pending") {
        throw new ErrorHandler("Friend request is not pending", 400);
    }

    // Check if either user has blocked the other
    if(friendship.isBlocked) {
        throw new ErrorHandler("Action not allowed (blocked)", 403);
    }

    // Check if the current user is the recipient of the friend request
    const isRecipient = friendship.recipient.toString() === currentUserId;

    if (!isRecipient) {
        throw new ErrorHandler("You are not allowed to accept this friend request.", 403);
    }

    // Update the friendship status to accepted
    friendship.status = "accepted";
    await friendship.save();

    return friendship;
}

/*
// Service to cancel a pending friend request
// const cancelRequestService = async (currentUserId, targetUserId) => {
//     // Prevent users from canceling friend requests to themselves
//     if (currentUserId === targetUserId) {
//         throw new ErrorHandler("You cannot cancel a friend request to yourself", 400);
//     }

//     let requester = currentUserId;
//     let recipient = targetUserId;

//     // Order requester and recipient IDs to ensure uniqueness regardless of direction
//     if (requester > recipient) {
//         [requester, recipient] = [recipient, requester];
//     }

//     // Check if a friendship already exists
//     const friendship = await Friendship.findOne({
//         requester,
//         recipient,
//     });

//     // Check if no friendship found
//     if (!friendship) {
//         throw new ErrorHandler("Friend request not found", 404);
//     }

//     // Check if friendship is not pending
//     if (friendship.status !== "pending") {
//         throw new ErrorHandler("Only pending friend requests can be canceled", 400);
//     }

//     // Check if the current user is the requester of the friend request
//     const isRequester = friendship.requester.toString() === currentUserId;

//     if (!isRequester) {
//         throw new ErrorHandler("You are not allowed to cancel this friend request.", 403);
//     }

//     // Check if either user has blocked the other
//     const currentUser = await User.findById(currentUserId);
//     const targetUser = await User.findById(targetUserId);

//     if (currentUser.blockedUsers.includes(targetUserId) ||
//         targetUser.blockedUsers.includes(currentUserId)) {
//         throw new ErrorHandler("Action not allowed (blocked)", 403);
//     }

//     // Delete the friend request
//     await friendship.deleteOne();

//     return true;
// }
 */

// Generalized service to handle canceling or rejecting a friend request
const handleRequestActionService = async (currentUserId, targetUserId, action) => {
    // Prevent users from canceling friend requests to themselves
    if (currentUserId === targetUserId) {
        // throw new ErrorHandler("You cannot cancel a friend request to yourself", 400);
        throw new ErrorHandler(`You cannot ${action} a friend request to yourself`, 400);
    }

    let requester = currentUserId;
    let recipient = targetUserId;

    // Order requester and recipient IDs to ensure uniqueness regardless of direction
    if (requester > recipient) {
        [requester, recipient] = [recipient, requester];
    }

    // Check if a friendship already exists
    const friendship = await Friendship.findOne({
        requester,
        recipient,
    });

    // Check if no friendship found
    if (!friendship) {
        throw new ErrorHandler("Friend request not found", 404);
    }

    // Check if friendship is not pending
    if (friendship.status !== "pending") {
        throw new ErrorHandler(`Only pending friend requests can be ${action}`, 400);
    }

    // Check if either user has blocked the other
    if(friendship.isBlocked) {
        throw new ErrorHandler("Action not allowed (blocked)", 403);
    }

    if (action === "cancel") {
        // Check if the current user is the requester of the friend request
        const isRequester = friendship.requester.toString() === currentUserId;

        if (!isRequester) {
            throw new ErrorHandler("You are not allowed to cancel this friend request.", 403);
        }
    }

    if (action === "reject") {
        // Check if the current user is the recipient of the friend request
        const isRecipient = friendship.recipient.toString() === currentUserId;

        if (!isRecipient) {
            throw new ErrorHandler("You are not allowed to reject this friend request.", 403);
        }
    }

    // Delete the friend request
    await friendship.deleteOne();

    return true;
}

// Service to get friends list for a user
const getFriendsService = async (userId) => {
    // Find all accepted friendships involving the user
    const friendships = await Friendship.find({
        $or: [
            { requester: userId },
            { recipient: userId },
        ],
        status: "accepted",
    })
        .populate("requester recipient", "username phoneNumber email avatar")
        .sort({ createdAt: -1 });

    // Map the friendships to return the friend user information
    const friends = friendships.map(friendship => {
        if (friendship.requester._id.toString() === userId.toString()) {
            return friendship.recipient;
        }
        return friendship.requester;
    });

    return friends;
}

// Service to remove a friend
const removeFriendService = async (currentUserId, targetUserId) => {
    // Prevent users from removing themselves from friends
    if (currentUserId === targetUserId) {
        throw new ErrorHandler("You cannot remove yourself from friends", 400);
    }

    let requester = currentUserId;
    let recipient = targetUserId;

    // Order requester and recipient IDs to ensure uniqueness regardless of direction
    if (requester > recipient) {
        [requester, recipient] = [recipient, requester];
    }

    // Check if a friendship already exists
    const friendship = await Friendship.findOne({
        requester,
        recipient,
    });

    // Check if no friendship found
    if (!friendship) {
        throw new ErrorHandler("Friendship not found", 404);
    }

    // Check if friendship is not accepted
    if (friendship.status !== "accepted") {
        throw new ErrorHandler("Only accepted friendships can be removed", 400);
    }

    // Delete the friendship
    await friendship.deleteOne();

    return true;
}

// Service to block a user
const blockUserService = async (currentUserId, targetUserId) => {
    // // Prevent users from blocking themselves
    if (currentUserId === targetUserId) {
        throw new ErrorHandler("You cannot block yourself", 400);
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
        throw new ErrorHandler("User not found", 404);
    }

    let requester = currentUserId;
    let recipient = targetUserId;

    // Order requester and recipient IDs
    if (requester > recipient) {
        [requester, recipient] = [recipient, requester];
    }

    // Find existing friendship
    let friendship = await Friendship.findOne({
        requester,
        recipient,
    });

    // If no friendship exists, create one
    if (!friendship) {
        friendship = await Friendship.create({
            requester,
            recipient,
            status: "removed", // Set status to removed since it's not an active friendship
            isBlocked: true,
            blockedBy: currentUserId,
            previousBlockStatus: "removed", // Store previous status for potential unblocking
        });

        return friendship;
    }

    // Check if already blocked
    if (friendship.isBlocked) {
        throw new ErrorHandler("User already blocked", 400);
    }

    // Update friendship
    friendship.previousBlockStatus = friendship.status; // Store current status before blocking
    friendship.status = "removed"; // Set status to removed when blocking
    friendship.isBlocked = true;
    friendship.blockedBy = currentUserId;

    await friendship.save();

    return friendship;
}

// Service to unblock a user
const unblockUserService = async (currentUserId, targetUserId) => {
    // // Prevent users from unblocking themselves
    if (currentUserId === targetUserId) {
        throw new ErrorHandler("You cannot unblock yourself", 400);
    }

    let requester = currentUserId;
    let recipient = targetUserId;

    // Keep ordering consistent
    if (requester > recipient) {
        [requester, recipient] = [recipient, requester];
    }

    // Find friendship
    const friendship = await Friendship.findOne({
        requester,
        recipient,
    });

    if (!friendship) {
        throw new ErrorHandler("Relationship not found", 404);
    }

    // Check if relationship is blocked
    if (!friendship.isBlocked) {
        throw new ErrorHandler("User is not blocked", 400);
    }

    // Only blocker can unblock
    if (
        friendship.blockedBy.toString() !== currentUserId.toString()
    ) {
        throw new ErrorHandler(
            "You are not allowed to unblock this user",
            403
        );
    }

    const previousStatus = friendship.previousBlockStatus || "removed"; // Default to removed if previous status is not set

    if (previousStatus === "removed") {
        // If there was no previous active friendship, we can simply delete the block record
        await friendship.deleteOne();
        return { message: "User unblocked successfully", friendship };
    } else {
        // Restore previous friendship status
        friendship.status = previousStatus;
        friendship.isBlocked = false;
        friendship.blockedBy = null;
        friendship.previousBlockStatus = null;

        await friendship.save();

        return friendship;
    }

    // // Remove block
    // friendship.status = "removed";
    // friendship.isBlocked = false;
    // friendship.blockedBy = null;

    // await friendship.deleteOne(); // Optionally delete the record or just update it based on your design choice

    // return friendship;
}

// Service to get the list of blocked users for a user
const getBlockedListService = async (currentUserId) => {
    // Find all blocked relationships involving the user
    const blockedFriendships = await Friendship.find({
        isBlocked: true,
        blockedBy: currentUserId
    })
        .populate("requester recipient", "username phoneNumber email avatar")
        .sort({ createdAt: -1 });

    // Map the relationships to return the blocked user information
    const blockedUsers = blockedFriendships.map(friendship => {
        if (friendship.requester._id.toString() === currentUserId.toString()) {
            return friendship.recipient;
        }
        return friendship.requester;
    });

    return blockedUsers;
}


module.exports = {
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
}