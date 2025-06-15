const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: "admin123",
      name: "Admin" // ✅ This is the correct way
    }
  });
}

main()
  .then(() => {
    console.log("Seeding completed.");
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error("Seeding failed:", e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });
