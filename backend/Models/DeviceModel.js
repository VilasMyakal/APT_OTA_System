const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  deviceId: { type: String, required: true, unique: true },
  dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Device', DeviceSchema); 