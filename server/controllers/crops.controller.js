const prisma = require('../utils/db');
const { calculateGrowthStage } = require('../utils/cropGrowth');
const { hasAccessToFarmer } = require('../utils/access');

const getCrops = async (req, res) => {
  try {
    const { farmId, farmerId } = req.query; // Optional filters
    const targetFarmerId = farmerId || req.user.id;

    const access = await hasAccessToFarmer(req.user.id, req.user.role, targetFarmerId);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Need to ensure the user owns the farm(s) these crops belong to
    const userFarms = await prisma.farm.findMany({
      where: { farmerId: targetFarmerId },
      select: { id: true },
    });
    
    const userFarmIds = userFarms.map(f => f.id);

    if (farmId && !userFarmIds.includes(farmId)) {
      return res.status(403).json({ error: "Access denied to this farm's crops" });
    }

    const crops = await prisma.crop.findMany({
      where: {
        farmId: farmId ? farmId : { in: userFarmIds },
      },
      include: {
        farm: { select: { name: true } }
      }
    });

    // SRS FR 3.2: Auto-calculate and update growth stages for non-manual crops
    const updatedCrops = await Promise.all(crops.map(async (crop) => {
      if (!crop.isManualStage && crop.status === 'Active') {
        const currentStage = calculateGrowthStage(crop.name, crop.plantedDate);
        if (currentStage !== crop.growthStage) {
          return prisma.crop.update({
            where: { id: crop.id },
            data: { growthStage: currentStage },
            include: { farm: { select: { name: true } } }
          });
        }
      }
      return crop;
    }));

    res.status(200).json(updatedCrops);
  } catch (error) {
    console.error('Get crops error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCropById = async (req, res) => {
  try {
    const { id } = req.params;
    const crop = await prisma.crop.findUnique({
      where: { id },
      include: { farm: true },
    });

    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    const access = await hasAccessToFarmer(req.user.id, req.user.role, crop.farm.farmerId);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check for auto-update
    if (!crop.isManualStage && crop.status === 'Active') {
      const currentStage = calculateGrowthStage(crop.name, crop.plantedDate);
      if (currentStage !== crop.growthStage) {
        const updatedCrop = await prisma.crop.update({
          where: { id: crop.id },
          data: { growthStage: currentStage },
          include: { farm: true }
        });
        return res.status(200).json(updatedCrop);
      }
    }

    res.status(200).json(crop);
  } catch (error) {
    console.error('Get crop error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createCrop = async (req, res) => {
  try {
    const { name, variation, plantedDate, growthStage, farmId } = req.body;

    if (!name || !plantedDate || !farmId) {
      return res.status(400).json({ error: 'Name, plantedDate, and farmId are required' });
    }

    // Check ownership of farm
    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm || farm.farmerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to this farm' });
    }

    // SRS FR 3.2: Calculate initial growth stage
    const initialStage = growthStage || calculateGrowthStage(name, plantedDate);

    const crop = await prisma.crop.create({
      data: {
        name,
        variation,
        plantedDate: new Date(plantedDate),
        growthStage: initialStage,
        isManualStage: !!growthStage, // If user provided it, mark as manual
        farmId,
      },
    });

    res.status(201).json(crop);
  } catch (error) {
    console.error('Create crop error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, variation, plantedDate, growthStage, status, yield: cropYield } = req.body;

    // Check ownership
    const crop = await prisma.crop.findUnique({
      where: { id },
      include: { farm: true },
    });
    
    if (!crop) return res.status(404).json({ error: 'Crop not found' });
    if (crop.farm.farmerId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const updatedCrop = await prisma.crop.update({
      where: { id: id },
      data: {
        ...(name && { name }),
        ...(variation && { variation }),
        ...(plantedDate && { plantedDate: new Date(plantedDate) }),
        ...(growthStage && { growthStage, isManualStage: true }), // SRS FR 3.3: Manual override
        ...(status && { status }),
        ...(cropYield !== undefined && { yield: parseFloat(cropYield) }),
      },
    });

    res.status(200).json(updatedCrop);
  } catch (error) {
    console.error('Update crop error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const crop = await prisma.crop.findUnique({
      where: { id },
      include: { farm: true },
    });
    
    if (!crop) return res.status(404).json({ error: 'Crop not found' });
    if (crop.farm.farmerId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    // SRS BR-5: Safety Rule: Farmers can only delete a plot after the current crop is marked as 'Harvested'
    if (crop.status === 'Active') {
      return res.status(400).json({ error: 'Safety Rule: You cannot delete an active crop. Please mark it as "Harvested" first.' });
    }

    await prisma.crop.delete({ where: { id } });

    res.status(200).json({ message: 'Crop deleted successfully' });
  } catch (error) {
    console.error('Delete crop error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop,
};
