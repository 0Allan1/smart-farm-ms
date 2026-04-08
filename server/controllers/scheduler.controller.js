const prisma = require('../utils/db');
const { getSchedulerAdvice } = require('../utils/scheduler');

const getAdvice = async (req, res) => {
  try {
    const { cropId, answers } = req.body;

    if (!cropId || !answers) {
      return res.status(400).json({ error: 'cropId and answers are required' });
    }

    const crop = await prisma.crop.findUnique({
      where: { id: cropId },
      include: { farm: true }
    });

    if (!crop || crop.farm.farmerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const advice = getSchedulerAdvice(crop, answers);

    res.status(200).json({
      cropId,
      advice,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Get scheduler advice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAdvice
};
