const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

require("dotenv").config();

const FirmwareModel = require("../Models/FirmwareTableModel");

const uploadPath = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname.split(".")[0]}-${Date.now()}.bin`);
  }
});

const uploadSingle = multer({ storage }).single("file");

module.exports = { uploadSingle };
