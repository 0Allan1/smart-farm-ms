const prisma = require('../utils/db');
const { getWeather, getAgriculturalAlerts } = require('../utils/weather');

const getAlerts = async (req, res) => {
  try {
    // FR 5.2 System performs weather checks and generates alerts
    // For this prototype, we check weather for Kigali (main region)
    // In production, we'd loop through the user's farm locations
    const weather = getWeather('Kigali');
    const weatherAlerts = getAgriculturalAlerts(weather);

    for (const wa of weatherAlerts) {
      // Avoid Duplicate Alerts: Check if an identical alert was created in the last 12 hours
      const existing = await prisma.alert.findFirst({
        where: {
          userId: req.user.id,
          message: wa.message,
          createdAt: { gt: new Date(Date.now() - 12 * 60 * 60 * 1000) }
        }
      });

      if (!existing) {
        await prisma.alert.create({
          data: {
            userId: req.user.id,
            type: wa.type,
            severity: wa.severity,
            message: wa.message
          }
        });
      }
    }

    const alerts = await prisma.alert.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const markAlertRead = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    if (alert.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const updatedAlert = await prisma.alert.update({
      where: { id },
      data: { read: true },
    });

    res.status(200).json(updatedAlert);
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    if (alert.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    await prisma.alert.delete({ where: { id } });

    res.status(200).json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAlerts,
  markAlertRead,
  deleteAlert,
};
