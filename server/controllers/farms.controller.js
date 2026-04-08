const prisma = require('../utils/db');
const { hasAccessToFarmer } = require('../utils/access');

const getFarms = async (req, res) => {
  try {
    const { farmerId } = req.query;
    const targetFarmerId = farmerId || req.user.id;

    const access = await hasAccessToFarmer(req.user.id, req.user.role, targetFarmerId);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const farms = await prisma.farm.findMany({
      where: { farmerId: targetFarmerId },
      include: {
        _count: {
          select: { crops: true },
        },
      },
    });
    res.status(200).json(farms);
  } catch (error) {
    console.error('Get farms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getFarmById = async (req, res) => {
  try {
    const { id } = req.params;
    const farm = await prisma.farm.findUnique({
      where: { id },
      include: { crops: true },
    });

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    const access = await hasAccessToFarmer(req.user.id, req.user.role, farm.farmerId);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json(farm);
  } catch (error) {
    console.error('Get farm error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createFarm = async (req, res) => {
  try {
    const { name, size, soilType, location } = req.body;

    if (!name || size === undefined || !soilType || !location) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const farm = await prisma.farm.create({
      data: {
        name,
        size: parseFloat(size),
        soilType,
        location,
        farmerId: req.user.id,
      },
    });

    res.status(201).json(farm);
  } catch (error) {
    console.error('Create farm error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateFarm = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, size, soilType, location } = req.body;

    // Check ownership
    const farm = await prisma.farm.findUnique({ where: { id } });
    if (!farm) return res.status(404).json({ error: 'Farm not found' });
    if (farm.farmerId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const updatedFarm = await prisma.farm.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(size && { size: parseFloat(size) }),
        ...(soilType && { soilType }),
        ...(location && { location }),
      },
    });

    res.status(200).json(updatedFarm);
  } catch (error) {
    console.error('Update farm error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteFarm = async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const farm = await prisma.farm.findUnique({ where: { id } });
    if (!farm) return res.status(404).json({ error: 'Farm not found' });
    if (farm.farmerId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    // Check for active crops
    const activeCrops = await prisma.crop.count({
      where: { farmId: id, status: 'Active' }
    });

    if (activeCrops > 0) {
      return res.status(400).json({ error: 'Safety Rule: This plot has active crops. Please harvest or remove them before deleting the plot.' });
    }

    await prisma.farm.delete({ where: { id } });

    res.status(200).json({ message: 'Farm deleted successfully' });
  } catch (error) {
    console.error('Delete farm error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm,
};
