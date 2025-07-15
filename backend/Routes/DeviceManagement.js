const Router = require('express').Router();
const Device = require('../Models/DeviceModel');

// Get all devices
Router.get('/', async (req, res) => {
  try {
    const devices = await Device.find().sort({ dateCreated: -1 });
    res.status(200).json(devices);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching devices', error: err.message });
  }
});

// Add new device
Router.post('/', async (req, res) => {
  try {
    const { name, deviceId } = req.body;
    if (!name || !deviceId) return res.status(400).json({ message: 'Name and Device ID are required' });
    const newDevice = new Device({ name, deviceId });
    await newDevice.save();
    res.status(201).json(newDevice);
  } catch (err) {
    res.status(500).json({ message: 'Error adding device', error: err.message });
  }
});

// Edit device
Router.put('/:id', async (req, res) => {
  try {
    const { name, deviceId } = req.body;
    const updated = await Device.findByIdAndUpdate(
      req.params.id,
      { name, deviceId },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Device not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating device', error: err.message });
  }
});

// Delete device
Router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Device.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Device not found' });
    res.status(200).json({ message: 'Device deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting device', error: err.message });
  }
});

module.exports = Router; 