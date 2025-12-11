// backend/routes/paperRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { generatePaper } = require('../controllers/paperController');

router.use(authMiddleware);

router.post('/generate', generatePaper);

module.exports = router;
