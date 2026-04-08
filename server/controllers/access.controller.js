const prisma = require('../utils/db');

/**
 * Generate a 6-digit share code for the farmer.
 * FR 8.1
 */
const generateShareCode = async (req, res) => {
  try {
    if (req.user.role !== 'Farmer') {
      return res.status(403).json({ error: 'Only farmers can generate share codes' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Deactivate old codes
    await prisma.shareCode.updateMany({
      where: { farmerId: req.user.id, isUsed: false },
      data: { isUsed: true }
    });

    const shareCode = await prisma.shareCode.create({
      data: {
        code,
        farmerId: req.user.id,
        expiresAt
      }
    });

    res.status(201).json(shareCode);
  } catch (error) {
    console.error('Generate code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Redeems a share code by an Extension Officer.
 * Creates a PENDING access request.
 * FR 8.2
 */
const redeemShareCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (req.user.role !== 'Extension Officer') {
      return res.status(403).json({ error: 'Only extension officers can redeem codes' });
    }

    const shareCode = await prisma.shareCode.findUnique({
      where: { code }
    });

    if (!shareCode || shareCode.isUsed || new Date() > shareCode.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired share code' });
    }

    // Check if access already exists (any status)
    const existingAccess = await prisma.officerAccess.findFirst({
      where: {
        farmerId: shareCode.farmerId,
        officerId: req.user.id
      }
    });

    if (existingAccess && existingAccess.status !== 'DENIED') {
      return res.status(400).json({ error: 'Access request already exists' });
    }

    // Create or update request
    const access = await prisma.officerAccess.upsert({
      where: { id: existingAccess?.id || 'temp' },
      update: { status: 'PENDING' },
      create: {
        farmerId: shareCode.farmerId,
        officerId: req.user.id,
        status: 'PENDING'
      }
    });

    // Mark code as used
    await prisma.shareCode.update({
      where: { id: shareCode.id },
      data: { isUsed: true }
    });

    res.status(201).json(access);
  } catch (error) {
    console.error('Redeem code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Farmer manages access requests.
 * FR 8.2
 */
const updateAccessStatus = async (req, res) => {
  try {
    const { accessId, status } = req.body; // status: APPROVED or DENIED
    
    if (req.user.role !== 'Farmer') {
      return res.status(403).json({ error: 'Only farmers can approve access' });
    }

    const access = await prisma.officerAccess.findUnique({
      where: { id: accessId }
    });

    if (!access || access.farmerId !== req.user.id) {
      return res.status(404).json({ error: 'Access request not found' });
    }

    const expiresAt = status === 'APPROVED' ? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) : null; // 6 months

    const updatedAccess = await prisma.officerAccess.update({
      where: { id: accessId },
      data: { status, expiresAt }
    });

    res.status(200).json(updatedAccess);
  } catch (error) {
    console.error('Update access error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get managed farmers for an officer.
 * FR 8.3
 */
const getManagedFarmers = async (req, res) => {
  try {
    if (req.user.role !== 'Extension Officer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const accessList = await prisma.officerAccess.findMany({
      where: {
        officerId: req.user.id,
        status: 'APPROVED',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            farms: {
              include: {
                _count: { select: { crops: true } }
              }
            }
          }
        }
      }
    });

    res.status(200).json(accessList.map(a => a.farmer));
  } catch (error) {
    console.error('Get managed farmers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get access requests for a farmer.
 */
const getFarmerAccessRequests = async (req, res) => {
  try {
    const requests = await prisma.officerAccess.findMany({
      where: { farmerId: req.user.id },
      include: {
        officer: {
          select: { id: true, name: true, phone: true }
        }
      }
    });
    res.status(200).json(requests);
  } catch (error) {
    console.error('Get farmer access requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  generateShareCode,
  redeemShareCode,
  updateAccessStatus,
  getManagedFarmers,
  getFarmerAccessRequests
};
