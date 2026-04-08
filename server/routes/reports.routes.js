const express = require('express');
const { getAnalytics, getExportData, getOfficerAggregateReport } = require('../controllers/reports.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/analytics', getAnalytics);
router.get('/export', getExportData);
router.get('/aggregate', getOfficerAggregateReport);

module.exports = router;
