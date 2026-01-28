const express = require('express');
const router = express.Router();
const smsController = require('../controller/smsController');

// POST /api/sms - Save new SMS message
router.post('/save', smsController.saveMessage);

// GET /api/sms/latest - Get latest messages and wipe database
router.get('/latest', smsController.getLatestMessages);

module.exports = router;