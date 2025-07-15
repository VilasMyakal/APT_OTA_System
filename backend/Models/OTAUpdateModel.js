const mongoose = require('mongoose');

const OTAUpdateSchema = new mongoose.Schema({
  pic_id: { type: String, required: true },
  deviceId: { type: String, required: true },
  status: { type: String, required: true },
  previousVersion: { type: String, required: true },
  updatedVersion: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OTAUpdate', OTAUpdateSchema); 