const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');
const cron = require('node-cron');

// Load env variables
dotenv.config();

// Init app
const app = express();
const prisma = new PrismaClient();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const claimRoutes = require('./routes/claimRoutes');
const wasteRoutes = require('./routes/wasteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminUtilityRoutes = require('./routes/adminUtilityRoutes');
const { swaggerUi, swaggerSpec } = require('./swagger');

// Base route
app.get('/', (req, res) => res.send('🚀 Food Management Backend Running'));

// Route mounts
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/claim', claimRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/util', adminUtilityRoutes); // ✅ Fixed conflict

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Cron Job: Run every 30 mins to mark expired food
cron.schedule('*/30 * * * *', async () => {
  const now = new Date();
  const expired = await prisma.food.updateMany({
    where: {
      expiryTime: { lt: now },
      status: 'AVAILABLE',
    },
    data: {
      status: 'EXPIRED',
    },
  });
  console.log(`[Cron] Marked ${expired.count} food items as EXPIRED`);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));

const redis = require('./config/redis');

app.get('/redis-test', async (req, res) => {
  await redis.set('testKey', 'Hello Redis!', 'EX', 10);
  const value = await redis.get('testKey');
  res.send(`Redis says: ${value}`);
});

