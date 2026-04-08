const prisma = require('./db');

/**
 * Checks if a user has access to a farmer's data.
 * Farmers have access to their own data.
 * Officers have access if they have an APPROVED request that hasn't expired.
 */
const hasAccessToFarmer = async (userId, userRole, farmerId) => {
  if (userRole === 'Admin') return true;
  if (userRole === 'Farmer' && userId === farmerId) return true;
  
  if (userRole === 'Extension Officer') {
    const access = await prisma.officerAccess.findFirst({
      where: {
        farmerId,
        officerId: userId,
        status: 'APPROVED',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });
    return !!access;
  }
  
  return false;
};

module.exports = {
  hasAccessToFarmer
};
