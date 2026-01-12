const asyncWrapper = require("../middlewares/asyncWrapper");
const User = require("../models/userModels");

// Registration logic will go here
const register = asyncWrapper(async (req, res, next) => {
    const { username, email, phoneNumber, password } = req.body;

    const newUser = new User({
        username,
        email,
        phoneNumber,
        password,
    });

    await newUser.save();

    // For demonstration, we just return the received data
    res.success({ username, email, phoneNumber }, 201);
});

module.exports = {
    register,
};