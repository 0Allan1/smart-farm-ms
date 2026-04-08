/**
 * Weather Service Utility
 * Simulates real-time and forecast weather data for Rwandan regions.
 * Fulfills FR 5.1
 */

const REGIONS = {
  'Kigali': { lat: -1.9441, lon: 30.0619 },
  'Musanze': { lat: -1.5083, lon: 29.6333 },
  'Huye': { lat: -2.6, lon: 29.7333 },
  'Rubavu': { lat: -1.6833, lon: 29.3667 }
};

const CONDITIONS = ['Sunny', 'Mostly Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain', 'Thunderstorm'];

/**
 * Generates a mock daily forecast or current weather.
 */
const getWeather = (location = 'Kigali') => {
  // Use location name or default to Kigali
  const seed = location.length;
  
  // Real-world Rwandan averages: 15°C - 28°C
  const temp = Math.floor(Math.random() * (28 - 18 + 1)) + 18;
  const condition = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
  const humidity = Math.floor(Math.random() * (90 - 40 + 1)) + 40;
  const windSpeed = (Math.random() * 15).toFixed(1);
  const precipitation = condition.includes('Rain') ? (Math.random() * 25).toFixed(1) : 0;

  return {
    location,
    temp,
    condition,
    humidity,
    windSpeed,
    precipitation,
    forecast: [
      { day: 'Tomorrow', temp: temp + 1, condition: CONDITIONS[Math.floor(Math.random() * 4)] },
      { day: 'Wed', temp: temp - 2, condition: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)] },
      { day: 'Thu', temp: temp, condition: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)] }
    ],
    timestamp: new Date()
  };
};

/**
 * Logic to determine if weather warrants an agricultural alert.
 * BR-referenced logic (FR 5.2)
 */
const getAgriculturalAlerts = (weather) => {
  const alerts = [];

  if (parseFloat(weather.precipitation) > 20 || weather.condition === 'Heavy Rain' || weather.condition === 'Thunderstorm') {
    alerts.push({
      type: 'weather',
      severity: 'danger',
      message: `Severe Weather Warning: Heavy precipitation (${weather.precipitation}mm) predicted. Protect young seedlings and check drainage.`,
      suggestion: 'Suspend all irrigation activities today.'
    });
  }

  if (weather.temp > 30) {
    alerts.push({
      type: 'weather',
      severity: 'warning',
      message: `Heatwave Alert: Temperatures rising above 30°C. Crops may experience heat stress.`,
      suggestion: 'Increase irrigation frequency using the scheduler.'
    });
  }

  if (weather.condition === 'Light Rain') {
    alerts.push({
      type: 'weather',
      severity: 'info',
      message: 'Favorable Conditions: Light rain predicted. Natural irrigation is sufficient for most crops.',
      suggestion: 'Good time to apply top-dressing fertilizers like Urea.'
    });
  }

  return alerts;
};

module.exports = {
  getWeather,
  getAgriculturalAlerts,
  REGIONS
};
