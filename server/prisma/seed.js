const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial Admin user...');

  const adminPhone = '0780000000';
  const adminPassword = 'AdminPassword123!';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Use upsert to prevent duplicates if seed is run multiple times
  const admin = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {},
    create: {
      name: 'System Admin',
      phone: adminPhone,
      email: 'admin@sfms.rw',
      password: hashedPassword,
      role: 'Admin',
    },
  });

  console.log('Admin user seeded successfully:', admin.phone);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
