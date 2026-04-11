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

const broadcastAlert = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { type, severity, message } = req.body;
    if (!type || !severity || !message) {
      return res.status(400).json({ error: 'Type, severity, and message are required' });
    }

    // Fetch all user IDs
    const users = await prisma.user.findMany({ select: { id: true } });
    
    // Create alerts for all users
    const alertData = users.map(user => ({
      type,
      severity,
      message,
      userId: user.id
    }));

    await prisma.alert.createMany({
      data: alertData
    });

    res.status(201).json({ message: `Broadcast sent successfully to ${users.length} users.` });
  } catch (error) {
    console.error('Broadcast alert error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const syncOfficerAccess = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const farmers = await prisma.user.findMany({ where: { role: 'Farmer' }, select: { id: true } });
    const officers = await prisma.user.findMany({ where: { role: 'Extension Officer' }, select: { id: true } });

    let linksCreated = 0;
    for (const officer of officers) {
      for (const farmer of farmers) {
        await prisma.officerAccess.upsert({
          where: {
            farmerId_officerId: {
              farmerId: farmer.id,
              officerId: officer.id
            }
          },
          update: {},
          create: {
            farmerId: farmer.id,
            officerId: officer.id,
            status: 'APPROVED'
          }
        });
        linksCreated++;
      }
    }

    res.status(200).json({ 
      message: `Sync complete. Verified links for ${officers.length} officers and ${farmers.length} farmers.` 
    });
  } catch (error) {
    console.error('Sync access error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getSystemStats,
  getAllUsers,
  provisionOfficer,
  broadcastAlert,
  syncOfficerAccess
};
