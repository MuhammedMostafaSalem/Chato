const fs = require("fs");
const path = require('path');
const multer = require("multer");
const ErrorHandler = require("../utils/errorHandler");

// Function to create multer storage dynamically
const createStorage = (folderPath) => {
    const uploadPath = path.join(__dirname, "..", folderPath);

    // Make sure the folder exists
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true })
    }

    return multer.diskStorage({
        destination: function (req, file, cb) {
            console.log("file:", file);
            cb(null, uploadPath)
        },
        filename: function (req, file, cb) {
            // const ext = path.extname(file.originalname);
            const txt = file.mimetype.split("/")[1]
            const fileName = `${Date.now()}.${txt}`;
            cb(null, fileName)
        }
    });
}

function fileFilter(req, file, cb) {
    const imageType = file.mimetype.split("/")[0]
    if (imageType === "image") return cb(null, true)
    else cb(new ErrorHandler('I don\'t have a clue!', 400), false)
}

// Function to create upload middleware
const createUploader = (folderPath) => {
    const storage = createStorage(folderPath);

    return multer({ storage, fileFilter });
}

module.exports = createUploader;