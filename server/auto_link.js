const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function autoLink() {
  try {
    console.log('1. Connecting to DB...');
    const farmers = await prisma.user.findMany({ where: { role: 'Farmer' } });
    const officers = await prisma.user.findMany({ where: { role: 'Extension Officer' } });
    console.log(`2. Found ${farmers.length} farmers, ${officers.length} officers.`);

    for (const officer of officers) {
      for (const farmer of farmers) {
        console.log(`3. Linking ${officer.name} to ${farmer.name}...`);
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
    console.log('4. Done!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}
autoLink();
