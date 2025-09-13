// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Delete all existing data
  console.log('Deleting existing data...');
  await prisma.notebook.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Existing data deleted.');

  // 2. Create the new admin user
  const saltRounds = 10;
  const password = 'admin';
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com', // Using a valid email format
      password: hashedPassword,
      role: 'ADMIN', // Set the role to ADMIN
    },
  });

  console.log(`Successfully created admin user: ${adminUser.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });