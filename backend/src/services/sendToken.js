const ms = require("ms");

// Function to send tokens to the user for login.
const sendToken = async (user, statusCode, res) => {
    // Generating an Access Token: Used to access protected resources (usually short lifespan)
    const accessToken = user.generateAccessToken();
    // Generating a Refresh Token: Used to obtain a new Access Token when the old token expires (it has a long lifespan).
    const refreshToken = user.generateRefreshToken();

    // Cookie settings (Security Options)
    const cookieOptions = {
        expires: new Date(Date.now() + ms(process.env.JWT_REFRESH_EXPIRE)),
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    }

    // Store the Refresh Token securely in your browser's cookies.
    res.cookie("refreshToken", refreshToken, cookieOptions);

    // Send success response
    res.success({
        message: "Logged in successfully",
        user,
        accessToken,
        refreshToken
    }, statusCode);
}

module.exports = sendToken;