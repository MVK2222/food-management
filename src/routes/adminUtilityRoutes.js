const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { verifyAdmin } = require('../middlewares/authMiddleware'); // Optional: role-based access
const { Parser } = require('json2csv');

const prisma = new PrismaClient();
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// ✅ Upload food data from CSV
router.post('/upload-csv', verifyAdmin, upload.single('file'), async (req, res) => {
  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        for (const entry of results) {
          if (!entry.name || !entry.quantity || !entry.expiryTime || !entry.donorId) continue;
          await prisma.food.create({
            data: {
              name: entry.name,
              quantity: Number(entry.quantity),
              status: 'AVAILABLE',
              expiryTime: new Date(entry.expiryTime),
              donorId: entry.donorId
            },
          });
        }
        fs.unlinkSync(req.file.path);
        res.json({ message: 'CSV upload processed', count: results.length });
      } catch (err) {
        fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
      }
    });
});

// ✅ Backup all DB collections to a JSON file
router.get('/backup-db', verifyAdmin, async (req, res) => {
  const users = await prisma.user.findMany();
  const foods = await prisma.food.findMany();
  const claims = await prisma.claim.findMany();
  const waste = await prisma.waste.findMany();

  const backup = { timestamp: new Date(), users, foods, claims, waste };
  res.setHeader('Content-disposition', 'attachment; filename=backup.json');
  res.setHeader('Content-type', 'application/json');
  res.send(JSON.stringify(backup, null, 2));
});

// ✅ Restore DB from uploaded JSON
router.post('/restore-db', verifyAdmin, upload.single('file'), async (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(req.file.path));
    await prisma.user.createMany({ data: data.users, skipDuplicates: true });
    await prisma.food.createMany({ data: data.foods, skipDuplicates: true });
    await prisma.claim.createMany({ data: data.claims, skipDuplicates: true });
    await prisma.waste.createMany({ data: data.waste, skipDuplicates: true });
    fs.unlinkSync(req.file.path);
    res.json({ message: 'Database restored successfully' });
  } catch (err) {
    fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Export food collection to CSV
router.get('/export-food-csv', verifyAdmin, async (req, res) => {
  try {
    const data = await prisma.food.findMany();
    const json2csv = new Parser();
    const csvData = json2csv.parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment('food-data.csv');
    res.send(csvData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Purge expired food items
router.delete('/purge-expired', verifyAdmin, async (req, res) => {
  try {
    const now = new Date();
    const result = await prisma.food.deleteMany({
      where: {
        expiryTime: { lt: now },
        status: 'AVAILABLE'
      }
    });
    res.json({ message: 'Expired food items purged', deletedCount: result.count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
