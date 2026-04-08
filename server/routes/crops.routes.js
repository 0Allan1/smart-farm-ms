const express = require('express');
const { getCrops, getCropById, createCrop, updateCrop, deleteCrop } = require('../controllers/crops.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getCrops);
router.get('/:id', getCropById);
router.post('/', createCrop);
router.put('/:id', updateCrop);
router.patch('/:id', updateCrop);
router.delete('/:id', deleteCrop);

module.exports = router;
