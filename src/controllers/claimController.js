const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// View available food for claim (NGO/User)
exports.getAvailableFoods = async (req, res) => {
  try {
    const now = new Date();

    const foods = await prisma.food.findMany({
      where: {
        status: 'AVAILABLE',
        expiryTime: { gt: now },
        donateReady: true,
      },
      include: {
        restaurant: { select: { name: true, email: true } },
      },
    });

    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching food', detail: err.message });
  }
};

// Request a claim
exports.requestClaim = async (req, res) => {
  try {
    const { foodId } = req.body;

    const food = await prisma.food.findUnique({ where: { id: foodId } });
    if (!food || food.status !== 'AVAILABLE' || !food.donateReady) {
      return res.status(400).json({ message: 'Food not available for claim' });
    }

    const existing = await prisma.claim.findFirst({
      where: { foodId, userId: req.user.userId }
    });

    if (existing) {
      return res.status(400).json({ message: 'Already requested this food' });
    }

    const claim = await prisma.claim.create({
      data: {
        foodId,
        userId: req.user.userId,
        status: 'PENDING',
      },
    });

    res.status(201).json({ message: 'Claim requested', claim });
  } catch (err) {
    res.status(500).json({ error: 'Error claiming food', detail: err.message });
  }
};

// View user’s own claims
exports.myClaims = async (req, res) => {
  const userId = req.user.userId;
  const cacheKey = `myClaims:${userId}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const claims = await prisma.claim.findMany({
      where: { userId },
      include: {
        food: true,
      },
    });

    await cacheSet(cacheKey, claims, 30); // Cache for 30 seconds
    res.json(claims);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching claims', detail: err.message });
  }
};

// Admin or restaurant approves/rejects a claim
exports.updateClaimStatus = async (req, res) => {
  try {
    const { claimId } = req.params;
    const { status } = req.body; // APPROVED or REJECTED

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const claim = await prisma.claim.update({
      where: { id: claimId },
      data: { status },
    });

    res.json({ message: `Claim ${status.toLowerCase()}`, claim });
  } catch (err) {
    res.status(500).json({ error: 'Error updating claim', detail: err.message });
  }
};

