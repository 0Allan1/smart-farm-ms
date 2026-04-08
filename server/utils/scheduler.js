/**
 * Scheduler logic for Irrigation and Fertilization advice.
 * Satisfies SRS FR 4.1-4.3 and BR-2, BR-3.
 */

const FERTILIZER_LOOKUP = {
  MAIZE: {
    Vegetative: { name: 'NPK 17-17-17', amount: 50, unit: 'kg/ha' },
    Flowering: { name: 'Urea', amount: 25, unit: 'kg/ha' },
  },
  BEANS: {
    Vegetative: { name: 'DAP', amount: 20, unit: 'kg/ha' },
  },
  CASSAVA: {
    'Leaf development': { name: 'NPK 17-17-17', amount: 100, unit: 'kg/ha' },
    'Tuber initiation': { name: 'Potassium Chloride', amount: 50, unit: 'kg/ha' },
  },
  RICE: {
    Tillering: { name: 'NPK 15-15-15', amount: 100, unit: 'kg/ha' },
    Flowering: { name: 'Urea', amount: 50, unit: 'kg/ha' },
  }
};

/**
 * Generates advice based on questionnaire answers and crop state.
 * @param {Object} crop - Crop object including name and growthStage.
 * @param {Object} answers - User answers from FR 4.1.
 * @returns {Object} - Advice object with recommendation and reason.
 */
const getSchedulerAdvice = (crop, answers) => {
  const { hasRained, soilFeel, isWilting } = answers;
  const advice = {
    irrigation: null,
    fertilization: null,
  };

  // 1. Irrigation Logic (BR-2 & NFR-5)
  if (soilFeel === 'Wet') {
    advice.irrigation = {
      recommendation: 'No irrigation needed.',
      reason: 'Soil is already wet. Over-irrigation can lead to root rot.'
    };
  } else if (hasRained === 'Yes') {
    advice.irrigation = {
      recommendation: 'Monitor soil moisture.',
      reason: 'Recent rainfall has provided natural moisture.'
    };
  } else if (soilFeel === 'Dry' || isWilting === 'Yes') {
    advice.irrigation = {
      recommendation: 'Irrigate 10 L/m².',
      reason: 'Dry soil conditions and/or signs of wilting detected.'
    };
  } else {
    advice.irrigation = {
      recommendation: 'No immediate irrigation needed.',
      reason: 'Soil moisture levels appear adequate.'
    };
  }

  // 2. Fertilization Logic (BR-3)
  const cropKey = crop.name.toUpperCase();
  const stages = FERTILIZER_LOOKUP[cropKey];
  
  if (stages && stages[crop.growthStage]) {
    const f = stages[crop.growthStage];
    advice.fertilization = {
      recommendation: `Apply ${f.amount} ${f.unit} of ${f.name}.`,
      reason: `Crop is in ${crop.growthStage} stage, requiring specific nutrient boost.`
    };
  } else {
    advice.fertilization = {
      recommendation: 'No fertilization recommended at this stage.',
      reason: 'Current growth stage does not require additional fertilizer per standard guidelines.'
    };
  }

  return advice;
};

module.exports = {
  getSchedulerAdvice,
  FERTILIZER_LOOKUP
};
