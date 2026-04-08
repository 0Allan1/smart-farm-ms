/**
 * Growth stage lookup tables for common Rwandan crops.
 * Durations are in days since planting.
 */
const CROP_TABLES = {
  MAIZE: [
    { name: 'Seedling', minDays: 0, maxDays: 20 },
    { name: 'Vegetative', minDays: 21, maxDays: 45 },
    { name: 'Flowering', minDays: 46, maxDays: 65 },
    { name: 'Ripening', minDays: 66, maxDays: 90 },
    { name: 'Harvested', minDays: 91, maxDays: 9999 }
  ],
  BEANS: [
    { name: 'Seedling', minDays: 0, maxDays: 15 },
    { name: 'Vegetative', minDays: 16, maxDays: 35 },
    { name: 'Flowering', minDays: 36, maxDays: 55 },
    { name: 'Pod filling', minDays: 56, maxDays: 75 },
    { name: 'Harvested', minDays: 76, maxDays: 9999 }
  ],
  CASSAVA: [
    { name: 'Sprouting', minDays: 0, maxDays: 30 },
    { name: 'Leaf development', minDays: 31, maxDays: 90 },
    { name: 'Tuber initiation', minDays: 91, maxDays: 180 },
    { name: 'Tuber bulk', minDays: 181, maxDays: 360 },
    { name: 'Harvested', minDays: 361, maxDays: 9999 }
  ],
  RICE: [
    { name: 'Seedling', minDays: 0, maxDays: 30 },
    { name: 'Tillering', minDays: 31, maxDays: 60 },
    { name: 'Panicle initiation', minDays: 61, maxDays: 90 },
    { name: 'Flowering', minDays: 91, maxDays: 110 },
    { name: 'Ripening', minDays: 111, maxDays: 130 },
    { name: 'Harvested', minDays: 131, maxDays: 9999 }
  ]
};

/**
 * Calculates current growth stage based on crop type and date planted.
 * @param {string} cropName - e.g. "Maize", "Beans"
 * @param {Date|string} plantedDate 
 * @returns {string} - Growth stage name
 */
const calculateGrowthStage = (cropName, plantedDate) => {
  const pDate = new Date(plantedDate);
  const today = new Date();
  const diffTime = Math.abs(today - pDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Determine key to use (case-insensitive)
  const key = cropName.toUpperCase();
  
  // Find matching table or use DEFAULT (Maize) if not found
  const table = CROP_TABLES[key] || CROP_TABLES.MAIZE;

  for (const stage of table) {
    if (diffDays >= stage.minDays && diffDays <= stage.maxDays) {
      return stage.name;
    }
  }

  return 'Seedling'; // Fallback
};

module.exports = {
  calculateGrowthStage,
  CROP_TABLES
};
