const mongoose = require("mongoose");
const ErrorHandler = require("../utils/errorHandler");

// Define the Friendship schema
const friendshipSchema = new mongoose.Schema({
    requester:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Requester is required"],
    },
    recipient:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Recipient is required"],
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "removed"],
        default: "pending",
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    previousBlockStatus: {
        type: String,
        enum: ["pending", "accepted", "removed", null],
        default: null,
    },
}, {
    timestamps: true,
});

// Create a unique index to prevent duplicate friendships (A-B or B-A)
friendshipSchema.index(
    { requester: 1, recipient: 1 },
    { unique: true }
);

// Pre-validation hook to order requester and recipient IDs
friendshipSchema.pre("validate", async function () {
    if (!this.requester || !this.recipient) return;

    if(this.requester.toString() > this.recipient.toString()) {
        const temp = this.requester;
        this.requester = this.recipient;
        this.recipient = temp;
    }
});

// Pre-save hook to prevent self-friendship
friendshipSchema.pre("save", async function () {
    if(this.requester.toString() === this.recipient.toString()) {
        return new ErrorHandler("You cannot send a friend request to yourself", 400);
    }
});

const Friendship = mongoose.model("Friendship", friendshipSchema);

module.exports = Friendship;