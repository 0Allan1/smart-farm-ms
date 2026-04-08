const express = require('express');
const { getAlerts, markAlertRead, deleteAlert } = require('../controllers/alerts.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAlerts);
router.patch('/:id/read', markAlertRead);
router.delete('/:id', deleteAlert);

module.exports = router;
