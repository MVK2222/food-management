const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

cron.schedule('0 3 * * 0', async () => {
  await prisma.food.deleteMany({ where: { status: 'EXPIRED' } });
  console.log('[Cron] Weekly expired food cleanup done');
});

cron.schedule('0 4 * * 0', async () => {
  const logsPath = './src/logs';
  for (const file of fs.readdirSync(logsPath)) {
    fs.writeFileSync(`${logsPath}/${file}`, '');
  }
  console.log('[Cron] Admin logs cleared');
});
