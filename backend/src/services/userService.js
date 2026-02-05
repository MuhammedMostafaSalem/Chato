const fs = require("fs");
const path = require("path");

// Helpers for preparing update data and handling avatar updates in user profile management
const allowedUpdates = ["username", "email", "phoneNumber", "bio"];

// Function to prepare update data by filtering allowed fields from the request body
const prepareUpdateData = (body) => {
    const updateData = {};

    // Iterate over allowed fields and add them to updateData if they exist in the request body
    allowedUpdates.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
            updateData[key] = body[key];
        }
    });

    // If no valid fields are provided, return an empty object
    return updateData;
}

// Function to handle avatar updates, including deleting old avatar if it exists and returning the new avatar URL
const handleAvatarUpdate = (user, file, req) => {
    // If no new file is uploaded, return null to indicate no avatar update
    if (!file) return null;

    // If the user already has an avatar, delete the old avatar file from the server
    if (user.avatar) {
        // Extract the old image name from the avatar URL and construct the file path
        const oldImageName = user.avatar.split("/upload/users/")[1];
        const oldImagePath = path.join(__dirname, "..", "upload", "users", oldImageName);

        // Check if the old image file exists before trying to delete it
        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
        }
    }

    // Return the URL of the new avatar image
    return `${req.protocol}://${req.get("host")}/upload/users/${file.filename}`;
}

const deleteAvatarFile = (user) => {
    // If the user has no avatar, there's nothing to delete
    if (!user.avatar) return;

    // Extract the image name from the avatar URL and construct the file path
    const imageName = user.avatar.split("/upload/users/")[1];
    const imagePath = path.join(__dirname, "..", "upload", "users", imageName);

    // Check if the image file exists before trying to delete it
    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }
}

module.exports = {
    prepareUpdateData,
    handleAvatarUpdate,
    deleteAvatarFile
}