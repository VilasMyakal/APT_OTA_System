const Router = require('express').Router();
const OTAUpdate = require('../Models/OTAUpdateModel');

// Get all OTA updates
Router.get('/', async (req, res) => {
  try {
    const updates = await OTAUpdate.find().sort({ date: -1 });
    res.status(200).json(updates);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching OTA updates', error: err.message });
  }
});

// Add new OTA update
Router.post('/', async (req, res) => {
  try {
    const { pic_id, deviceId, status, previousVersion, updatedVersion } = req.body;
    if (!pic_id || !deviceId || !status || !previousVersion || !updatedVersion) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Normalize status
    let normalizedStatus = 'Failed';
    if (status === 'Programming Successfull') {
      normalizedStatus = 'Success';
    }else if (status === 'Programming Unsuccessful') {
      normalizedStatus = 'Failed';
    }else{
      normalizedStatus = 'In Progress';
    }
    const newUpdate = new OTAUpdate({ pic_id, deviceId, status, normalizedStatus, previousVersion, updatedVersion });
    await newUpdate.save();
    res.status(201).json(newUpdate);
  } catch (err) {
    res.status(500).json({ message: 'Error adding OTA update', error: err.message });
  }
});

// Delete OTA update
Router.delete('/:id', async (req, res) => {
  try {
    const deleted = await OTAUpdate.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'OTA update not found' });
    res.status(200).json({ message: 'OTA update deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting OTA update', error: err.message });
  }
});

module.exports = Router; 
