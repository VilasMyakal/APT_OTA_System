const path = require("path");
const fs = require("fs");
const Router = require("express").Router();

const FirmwareModel = require("../Models/FirmwareTableModel");


// File Uploading API

// Ensure uploads/ directory exists
const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Validate only .bin files
const fileFilter = (req, file, cb) => {
  if (path.extname(file.originalname).toLowerCase() === ".bin") {
    cb(null, true);
  } else {
    cb(new Error("Only .bin files are allowed"));
  }
};

// Multer disk storage config
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname.split(".")[0]}-${Date.now()}.bin`);
  },
});
const uploadSingle = multer({ storage, fileFilter }).single("file");

// Helper: format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// === UPLOAD API ===
Router.post("/upload", uploadSingle, async (req, res) => {
  try {
    const { version, description, esp_id } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const fileBuffer = fs.readFileSync(req.file.path); // Read after multer saves

    const newFirmware = new FirmwareModel({
      version,
      description,
      esp_id,
      uploadedDate: new Date(),
      fileSize: formatFileSize(req.file.size),
      fileData: fileBuffer,
      fileMimeType: req.file.mimetype,
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
    });

    await newFirmware.save();

    // Remove temp file after storing in DB
    fs.unlinkSync(req.file.path);

    res.status(200).json({ message: "Firmware uploaded and stored in DB" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// Get All Firmwares Details API

Router.get('/firmwares-details',async (req,res)=>{

    try{
        const firmwares = await FirmwareModel.find().sort({uploadedDate: -1});
        res.status(200).json(firmwares);
    }catch(err){
        res.status(500).json({
            message: "Error fetching firmware details",
            error: err.message
        });
    }

});


// Get Lateset Firmware Version

Router.get('/latest-version/:esp_id',async (req,res)=>{

    try{

        const latestFirmware = await FirmwareModel.findOne({esp_id: req.params.esp_id}).sort({uploadedDate: -1});
        if (!latestFirmware) {
            return res.status(404).json({ message: "No firmware found" });
        }
        res.status(200).json({
            version: latestFirmware.version
        });
        
    }catch(err){
        res.status(500).json({
            message: "Error fetching latest version",
            error: err.message
        });
    }

});

// Get Latest Firmware File URL


Router.get("/latest-firmware/:esp_id", async (req, res) => {
  try {
    const latestFirmware = await FirmwareModel.findOne({esp_id: req.params.esp_id}).sort({ uploadedDate: -1 });

    if (!latestFirmware) {
      return res.status(404).json({ message: "No firmware found" });
    }

    res.set("Content-Type", latestFirmware.fileMimeType || 'application/octet-stream');
    res.set("Content-Disposition", `attachment; filename="${latestFirmware.fileName || 'firmware.bin'}"`);
    res.send(latestFirmware.fileData);
  } catch (err) {
    res.status(500).json({ message: "Download failed", error: err.message });
  }
});

// Download specific firmware by ID
Router.get("/download/:id", async (req, res) => {
  try {
    const firmware = await FirmwareModel.findById(req.params.id);
    if (!firmware) {
      return res.status(404).json({ message: "Firmware not found" });
    }
    res.set("Content-Type", firmware.fileMimeType || 'application/octet-stream');
    res.set("Content-Disposition", `attachment; filename=\"${firmware.originalFileName || firmware.fileName || 'firmware.bin'}\"`);
    res.send(firmware.fileData);
  } catch (err) {
    res.status(500).json({ message: "Download failed", error: err.message });
  }
});


Router.delete("/delete/:id", async (req, res) => {
  try {
    const firmware = await FirmwareModel.findById(req.params.id);

    if (!firmware) {
      return res.status(404).json({ message: "Firmware not found" });
    }

    await FirmwareModel.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Firmware deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});



// Firmware Report API

Router.post("/report", async (req, res) => {
  try {
    const { pic_id,esp_id, status, previous_firmware_version, updated_firmware_version } = req.body;

    // Simple validation
    if (!pic_id ||esp_id|| !status || !previous_firmware_version || !updated_firmware_version) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Log or save report (example: console log)
    console.log("Firmware Update Report:");
    console.log("PIC ID:", pic_id);
    console.log("Device ID:", esp_id);
    console.log("Status:", status);
    console.log("Previous:", previous_firmware_version);
    console.log("Updated:", updated_firmware_version);


    return res.status(200).json({ message: "Report received" });
  } catch (err) {
    console.error("Report error:", err);
    res.status(500).json({ message: "Failed to process report", error: err.message });
  }
});

module.exports = Router;










module.exports = Router;