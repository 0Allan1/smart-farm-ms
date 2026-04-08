const prisma = require('../utils/db');

const createAdvice = async (req, res) => {
  try {
    const { content, cropId } = req.body;
    const officerId = req.user.id;

    if (!content || !cropId) {
      return res.status(400).json({ error: 'Content and cropId are required' });
    }

    if (req.user.role !== 'Extension Officer') {
      return res.status(403).json({ error: 'Only extension officers can leave advice' });
    }

    // Check if crop exists
    const crop = await prisma.crop.findUnique({
      where: { id: cropId },
      include: { farm: true }
    });

    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    // Verify officer has access to this farmer
    const access = await prisma.officerAccess.findFirst({
      where: {
        officerId,
        farmerId: crop.farm.farmerId,
        status: 'APPROVED',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    if (!access) {
      return res.status(403).json({ error: 'Access denied to this farmer' });
    }

    const advice = await prisma.officerAdvice.create({
      data: {
        content,
        cropId,
        officerId
      },
      include: {
        officer: { select: { name: true } }
      }
    });

    res.status(201).json(advice);
  } catch (error) {
    console.error('Create advice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAdviceByCrop = async (req, res) => {
  try {
    const { cropId } = req.params;

    const advice = await prisma.officerAdvice.findMany({
      where: { cropId },
      include: {
        officer: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(advice);
  } catch (error) {
    console.error('Get advice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createAdvice,
  getAdviceByCrop
};
