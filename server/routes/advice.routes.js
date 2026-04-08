const express = require('express');
const { createAdvice, getAdviceByCrop } = require('../controllers/advice.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createAdvice);
router.get('/:cropId', getAdviceByCrop);

module.exports = router;
