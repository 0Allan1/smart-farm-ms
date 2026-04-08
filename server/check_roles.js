const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRoles() {
  try {
    const roles = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });
    console.log('--- DATABASE ROLE AUDIT ---');
    console.log(JSON.stringify(roles, null, 2));
    console.log('---------------------------');
  } catch (err) {
    console.error('Audit failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRoles();
