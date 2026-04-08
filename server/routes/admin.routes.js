const express = require('express');
const { getSystemStats, getAllUsers, provisionOfficer } = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.post('/officers', provisionOfficer);

module.exports = router;
