const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditAccess() {
  try {
    const access = await prisma.officerAccess.findMany({
      include: {
        farmer: { select: { name: true } },
        officer: { select: { name: true, role: true } }
      }
    });
    console.log('--- ACCESS RECORDS AUDIT ---');
    console.log(JSON.stringify(access, null, 2));
    console.log('----------------------------');
  } catch (err) {
    console.error('Audit failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

auditAccess();
