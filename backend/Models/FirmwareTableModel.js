const mongoose = require("mongoose");

const FirmwareSchema = new mongoose.Schema({
  version: { type: String, required: true },
  fileSize: { type: String, required: true },
  uploadedDate: { type: Date, default: Date.now },
  description: { type: String, required: true },
  esp_id: { type: String, required: true },
  fileData: { type: Buffer, required: true }, // Storing the file as Buffer
  fileMimeType: { type: String, required: true }, // e.g., 'application/octet-stream'
  fileName: { type: String, required: true }, // To give the original name when downloading
  originalFileName: { type: String, required: true } // The true original filename as uploaded by the user
});

module.exports = mongoose.model("firmware-details", FirmwareSchema);
