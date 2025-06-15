const { PrismaClient } = require('@prisma/client');
const { uploadToS3 } = require('../utils/s3');


const prisma = new PrismaClient();

exports.createFood = async (req, res) => {
  try {
    const { title, description, quantity, expiryTime, donateReady } = req.body;
    const imageUrl = await uploadToS3(req.file); // S3 URL

    const food = await prisma.food.create({
      data: {
        title,
        description,
        quantity: parseInt(quantity),
        expiryTime: new Date(expiryTime),
        imageUrl,
        donateReady: donateReady === 'true',
        restaurantId: req.user.userId,
      }
    });

    res.status(201).json({ message: 'Food posted successfully', food });
  } catch (err) {
    res.status(500).json({ message: 'Error creating food post', error: err.message });
  }
};

// Get all foods with search, filter, sort, and pagination
exports.getAllFoods = async (req, res) => {
  try {
    console.log("👉 Query received:", req.query);

    const { search, category, city, page = 1, limit = 10, sort } = req.query;

    // Build Prisma-compatible filter object
    const prismaFilter = {};
    if (search) {
      prismaFilter.title = { contains: search, mode: 'insensitive' };
    }
    if (category) {
      prismaFilter.category = category;
    }
    if (city) {
      prismaFilter.city = city;
    }

    console.log("🔍 Filter built:", prismaFilter);

    // Pagination values
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    console.log(`📦 Pagination => Skip: ${skip} Limit: ${take}`);

    // Sorting
    let prismaSort = [];
    if (sort) {
      prismaSort = sort.split(',').map(field => {
        if (field.startsWith('-')) {
          return { [field.slice(1)]: 'desc' };
        }
        return { [field]: 'asc' };
      });
    } else {
      prismaSort = [{ createdAt: 'desc' }];
    }

    console.log("🔃 Sort Option:", prismaSort);

    // Total count
    const total = await prisma.food.count({where:prismaFilter});


    // Data fetch
    const foods = await prisma.food.findMany({
      where: prismaFilter,
      orderBy: prismaSort,
      skip,
      take
    });

    // Response
    res.status(200).json({
      success: true,
      count: foods.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / take),
      data: foods
    });

  } catch (error) {
    console.error("❌ Error in getAllFoods:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getAvailableFoods = async (req, res) => {
  const cacheKey = 'availableFoods:public';

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const foods = await prisma.food.findMany({
      where: {
        status: 'AVAILABLE',
        expiryTime: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        quantity: true,
        category: true,
        city: true,
        imageUrl: true,
        expiryTime: true,
      },
    });

    await cacheSet(cacheKey, foods, 60); // 1-minute cache
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch food', detail: err.message });
  }
};



