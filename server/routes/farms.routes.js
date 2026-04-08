const express = require('express');
const { getFarms, getFarmById, createFarm, updateFarm, deleteFarm } = require('../controllers/farms.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getFarms);
router.get('/:id', getFarmById);
router.post('/', createFarm);
router.put('/:id', updateFarm);
router.delete('/:id', deleteFarm);

module.exports = router;
