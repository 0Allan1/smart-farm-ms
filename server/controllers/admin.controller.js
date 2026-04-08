const prisma = require('../utils/db');

const getSystemStats = async (req, res) => {
  try {
    // Only admins checking
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const totalUsers = await prisma.user.count();
    const totalFarmers = await prisma.user.count({ where: { role: 'Farmer' } });
    const totalOfficers = await prisma.user.count({ where: { role: 'Extension Officer' } });
    
    const activeCrops = await prisma.crop.count({ where: { status: 'Active' } });
    const systemAlerts = await prisma.alert.count();

    res.status(200).json({
      totalUsers,
      totalFarmers,
      totalOfficers,
      activeCrops,
      systemAlerts
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: { farms: true, shareCodes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const provisionOfficer = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, phone, email, password } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone, and password are required' });
    }

    const bcrypt = require('bcrypt');
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this phone number already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const officer = await prisma.user.create({
      data: {
        name,
        phone,
        email: email || null,
        password: hashedPassword,
        role: 'Extension Officer',
      },
    });

    // Automatically link the new officer to all existing farmers (same as auto_link.js)
    const farmers = await prisma.user.findMany({ where: { role: 'Farmer' } });
    for (const farmer of farmers) {
      // Skip if a link already exists
      const existing = await prisma.officerAccess.findFirst({
        where: { officerId: officer.id, farmerId: farmer.id }
      });
      if (!existing) {
        await prisma.officerAccess.create({
          data: {
            officerId: officer.id,
            farmerId: farmer.id,
            status: 'APPROVED',
            expiresAt: new Date(Date.now() + 31536000000) // 1 year
          }
        });
      }
    }

    res.status(201).json({ id: officer.id, name: officer.name, role: officer.role, linkedFarmers: farmers.length });
  } catch (error) {
    console.error('Provision officer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getSystemStats,
  getAllUsers,
  provisionOfficer
};
