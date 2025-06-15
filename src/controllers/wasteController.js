const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Restaurant marks waste
exports.markWaste = async (req, res) => {
  try {
    const { name, category, quantity, unit } = req.body;

    const waste = await prisma.waste.create({
      data: {
        name,
        category,
        quantity,
        unit,
        restaurantId: req.user.userId,
      },
    });

    res.status(201).json({ message: 'Waste marked', waste });
  } catch (err) {
    res.status(500).json({ error: 'Error marking waste', detail: err.message });
  }
};

// Recycler views available waste
exports.viewAvailableWaste = async (req, res) => {
  const cacheKey = 'waste:available';

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const waste = await prisma.waste.findMany({
      where: { status: 'PENDING' },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    await cacheSet(cacheKey, waste, 120); // 2 min cache
    res.json(waste);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching waste items', detail: err.message });
  }
  await cacheDelete('waste:available');

};


// Recycler requests collection
exports.requestWasteCollection = async (req, res) => {
  try {
    const { wasteId } = req.body;

    const request = await prisma.recyclerRequest.create({
      data: {
        wasteId,
        recyclerId: req.user.userId,
        status: 'PENDING',
      },
    });

    res.status(201).json({ message: 'Collection request sent', request });
  } catch (err) {
    res.status(500).json({ error: 'Error sending request', detail: err.message });
  }
};

// Recycler sees their requests
exports.myRecyclerRequests = async (req, res) => {
  try {
    const requests = await prisma.recyclerRequest.findMany({
      where: { recyclerId: req.user.userId },
      include: { waste: true },
    });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching requests', detail: err.message });
  }
};
