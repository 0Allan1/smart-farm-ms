const { calculateGrowthStage } = require('./utils/cropGrowth');

const testGrowth = () => {
  const cases = [
    { name: 'Maize', plantedDaysAgo: 5, expected: 'Seedling' },
    { name: 'Maize', plantedDaysAgo: 30, expected: 'Vegetative' },
    { name: 'Maize', plantedDaysAgo: 50, expected: 'Flowering' },
    { name: 'Maize', plantedDaysAgo: 80, expected: 'Ripening' },
    { name: 'Maize', plantedDaysAgo: 100, expected: 'Harvested' },
    { name: 'Beans', plantedDaysAgo: 5, expected: 'Seedling' },
    { name: 'Beans', plantedDaysAgo: 20, expected: 'Vegetative' },
    { name: 'Beans', plantedDaysAgo: 40, expected: 'Flowering' },
    { name: 'Beans', plantedDaysAgo: 60, expected: 'Pod filling' },
    { name: 'Beans', plantedDaysAgo: 80, expected: 'Harvested' },
  ];

  console.log('--- Growth Stage Verification ---');
  let passed = 0;
  cases.forEach(c => {
    const plantedDate = new Date();
    plantedDate.setDate(plantedDate.getDate() - c.plantedDaysAgo);
    
    const actual = calculateGrowthStage(c.name, plantedDate);
    const result = actual === c.expected ? '✅ PASS' : `❌ FAIL (Expected ${c.expected}, got ${actual})`;
    console.log(`${c.name} (Planted ${c.plantedDaysAgo} days ago): ${result}`);
    if (actual === c.expected) passed++;
  });

  console.log(`\nResult: ${passed}/${cases.length} passed.`);
};

testGrowth();
