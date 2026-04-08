const prisma = require('../utils/db');

const getActivities = async (req, res) => {
  try {
    const { cropId } = req.query;
    
    if (!cropId) {
      return res.status(400).json({ error: 'cropId is required' });
    }

    // Check ownership of the crop
    const crop = await prisma.crop.findUnique({
      where: { id: cropId },
      include: { farm: true }
    });

    if (!crop || crop.farm.farmerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const activities = await prisma.activity.findMany({
      where: { cropId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createActivity = async (req, res) => {
  try {
    const { type, amount, unit, notes, metadata, cropId } = req.body;

    if (!type || !cropId) {
      return res.status(400).json({ error: 'Type and cropId are required' });
    }

    // Check ownership
    const crop = await prisma.crop.findUnique({
      where: { id: cropId },
      include: { farm: true }
    });

    if (!crop || crop.farm.farmerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const activity = await prisma.activity.create({
      data: {
        type,
        amount: amount ? parseFloat(amount) : null,
        unit,
        notes,
        metadata,
        cropId
      }
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getActivities,
  createActivity
};
