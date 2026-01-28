import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/password';

const prisma = new PrismaClient();

async function main() {
  // Seed investors (skip if already exist)
  const investorNames = [
    'Jaime Gomez Morales',
    'Jaime Gomez Dominguez',
    'Monica Dominguez',
  ];

  for (const name of investorNames) {
    const existing = await prisma.investor.findFirst({ where: { name } });
    if (!existing) {
      await prisma.investor.create({
        data: { name, profitPercentage: 70.00 },
      });
      console.log(`Created investor: ${name}`);
    } else {
      console.log(`Investor already exists: ${name}`);
    }
  }

  const investors = await prisma.investor.findMany();
  console.log('Investors:', investors.map(i => ({ id: i.id, name: i.name })));

  // Seed default admin user
  const adminEmail = 'admin@gdprestamos.mx';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await hashPassword('admin123');
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin',
        role: 'admin',
      },
    });
    console.log(`Created admin user: ${admin.email} (password: admin123)`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
