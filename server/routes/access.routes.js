const express = require('express');
const { 
  generateShareCode, 
  redeemShareCode, 
  updateAccessStatus, 
  getManagedFarmers, 
  getFarmerAccessRequests 
} = require('../controllers/access.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/generate', generateShareCode);
router.post('/redeem', redeemShareCode);
router.post('/status', updateAccessStatus);
router.get('/managed', getManagedFarmers);
router.get('/requests', getFarmerAccessRequests);

module.exports = router;
