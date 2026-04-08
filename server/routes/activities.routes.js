const express = require('express');
const { getActivities, createActivity } = require('../controllers/activities.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getActivities);
router.post('/', createActivity);

module.exports = router;
