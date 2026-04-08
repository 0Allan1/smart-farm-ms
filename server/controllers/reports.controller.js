const prisma = require('../utils/db');

const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get Activity Distribution (Irrigation vs Fertilization) over last 30 days
    const activities = await prisma.activity.findMany({
      where: {
        crop: { farm: { farmerId: userId } },
        createdAt: { gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      },
      select: { type: true, createdAt: true }
    });

    // 2. Group activities by date and type
    const activityTrend = {};
    activities.forEach(a => {
      const date = a.createdAt.toISOString().split('T')[0];
      if (!activityTrend[date]) activityTrend[date] = { Irrigation: 0, Fertilization: 0 };
      if (activityTrend[date][a.type] !== undefined) activityTrend[date][a.type]++;
    });

    // 3. Get Crop Growth Stage Distribution
    const crops = await prisma.crop.findMany({
      where: { farm: { farmerId: userId }, status: 'Active' },
      select: { growthStage: true }
    });

    const stageCounts = {};
    crops.forEach(c => {
      stageCounts[c.growthStage] = (stageCounts[c.growthStage] || 0) + 1;
    });

    res.status(200).json({
      activityTrend,
      stageCounts,
      summary: {
        totalCrops: crops.length,
        totalActivities: activities.length
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getExportData = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await prisma.crop.findMany({
      where: { farm: { farmerId: userId } },
      include: {
        farm: { select: { name: true, location: true } },
        activities: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getOfficerAggregateReport = async (req, res) => {
  try {
    const officerId = req.user.id;

    // 1. Get all farmers this officer has access to
    const approvedRelations = await prisma.officerAccess.findMany({
      where: {
        officerId,
        status: 'APPROVED',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      select: { farmerId: true }
    });

    const farmerIds = approvedRelations.map(rel => rel.farmerId);

    if (farmerIds.length === 0) {
      return res.status(200).json([]);
    }

    // 2. Fetch all crops and activities for these farmers
    const data = await prisma.crop.findMany({
      where: { farm: { farmerId: { in: farmerIds } } },
      include: {
        farm: { 
          include: { 
            farmer: { select: { name: true } } 
          } 
        },
        activities: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('Officer aggregate report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAnalytics,
  getExportData,
  getOfficerAggregateReport
};
