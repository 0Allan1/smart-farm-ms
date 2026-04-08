const express = require('express');
const { getAdvice } = require('../controllers/scheduler.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/advice', getAdvice);

module.exports = router;
