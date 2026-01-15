const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// User Schema Definition
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        minlength: [2, "Username must be at least 2 characters"],
        maxlength: [30, "Username must be at most 30 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please enter a valid email address"
        ],
    },
    phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
        unique: true,
        trim: true,
        match: [
            /^\+?[1-9]\d{1,14}$/,
            "Phone number must include: the country code and consist of 10 to 15 digits."
        ],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        maxlength: [20, "Password must be at most 20 characters"],
        select: false,  // Exclude password field by default when querying
        validate: {
            validator: function (value) {
                return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&_-]{6,20}$/.test(value);
            },
            message: "Password must be 6-20 characters, contain at least one letter and one number, and may include symbols: _@$!%*#?&-"
        }
    },
    avatar: String,
    bio: String,
    isOnline: {
        type: Boolean,
        default: false,
    },
    lastSeen: Date,
    connect: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    blockedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    isVerified: {
        type: Boolean,
        default: false,
    },
    otp: String,
    otpExpires: Date,
    otpResendTimeout: Date,
    otpPurpose: {
        type: String,
        enum: ["email_verification", "forgot_password"],
    },
}, {
    timestamps: true // Automatically manage createdAt and updatedAt fields
});

// Hash password before saving the user
userSchema.pre('save', async function () {
    // only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return;

    // generate a salt
    const saltRounds = await bcrypt.genSalt(10);
    // hash the password along with our new salt
    this.password = await bcrypt.hash(this.password, saltRounds);
});

// Method to compare given password with the database hash
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}

// Method to generate and hash OTP
userSchema.methods.generateOtp = async function (purpose) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // generate a 6-digit OTP

    const saltRounds = await bcrypt.genSalt(10); // generate a salt
    this.otp = await bcrypt.hash(otp, saltRounds); // hash the OTP
    this.otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    this.otpResendTimeout = Date.now() + 60 * 1000; // Resend allowed after 1 minute
    this.otpPurpose = purpose;

    return otp;
}

// Method to generate JWT token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRE }
    );
}

// method to generate Refresh JWT token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    )
}

const User = mongoose.model("User", userSchema);

module.exports = User;