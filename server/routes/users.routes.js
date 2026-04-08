const express = require('express');
const { getProfile, updateProfile } = require('../controllers/users.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/me', getProfile);
router.put('/me', updateProfile);

module.exports = router;
