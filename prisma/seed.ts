import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const dummy = await prisma.dummy.upsert({
    where: { id: 'seed-1' },
    update: {},
    create: {
      id: 'seed-1',
      message: 'Hello from Prestamos DB!',
    },
  });

  console.log('Seeded:', dummy);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
