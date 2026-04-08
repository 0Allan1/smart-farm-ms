const express = require('express');
const { getWeather } = require('../utils/weather');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/current', (req, res) => {
  try {
    const { location } = req.query;
    const weatherData = getWeather(location || 'Kigali');
    res.status(200).json(weatherData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

module.exports = router;
