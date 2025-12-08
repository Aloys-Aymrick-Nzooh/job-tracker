// src/routes/status.routes.js
const express = require('express');
const router = express.Router();
const { checkStatus } = require('../controllers/status.controller'); 

router.get('/status', checkStatus); 

module.exports = router;