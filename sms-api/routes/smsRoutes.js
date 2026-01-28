const express = require('express');
const router = express.Router();
const smsController = require('../controller/smsController');

// POST - Save new SMS message
router.post('/save', smsController.saveMessage);

// GET - Get latest messages and wipe database
router.get('/latest', smsController.getLatestMessages);

// DELETE - Wipe database of all data
router.delete('/delete-db', smsController.deleteDb);

module.exports = router;