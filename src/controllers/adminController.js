const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ---------------------------- UTILS ---------------------------- //
const parseDate = (input, fallback) => {
  const date = new Date(input);
  return isNaN(date.getTime()) ? fallback : date;
};

// ---------------------- 1. Dashboard Stats --------------------- //
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      ngoCount,
      restaurantCount,
      recyclerCount,
      normalUserCount,
      donations,
      availableDonations,
      totalClaims,
      claimedCount,
      totalWaste,
      collectedWaste,
      recyclerRequests
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'NGO' } }),
      prisma.user.count({ where: { role: 'RESTAURANT' } }),
      prisma.user.count({ where: { role: 'RECYCLER' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.food.count(),
      prisma.food.count({ where: { status: 'AVAILABLE' } }),
      prisma.claim.count(),
      prisma.claim.count({ where: { status: 'ACCEPTED' } }),
      prisma.waste.count(),
      prisma.waste.count({ where: { status: 'PICKED' } }),
      prisma.recyclerRequest.count()
    ]);

    res.json({
      totalUsers,
      userRoles: { normalUserCount, ngoCount, restaurantCount, recyclerCount },
      foodStats: { totalDonations: donations, availableDonations },
      claims: { totalClaims, claimedCount },
      wasteStats: { totalWaste, collectedWaste },
      recyclerRequests
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Dashboard error', detail: err.message });
  }
};

// 2. Get All Users
exports.getAllUsers = async (req, res) => {
  const cacheKey = 'admin:users:list';

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    await cacheSet(cacheKey, users, 300); // 5 min cache
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', detail: err.message });
  }
};


// 3. Delete User by ID
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    //await prisma.user.delete({ where: { id: userId } });
    await prisma.user.update({where: { id: userId },data: { deletedAt: new Date() }});
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting user', detail: err.message });
  }
};

// 4. Recent Activities (last 10 entries)
exports.getRecentActivities = async (req, res) => {
  try {
    const [recentDonations, recentClaims, recentWaste] = await Promise.all([
      prisma.food.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.claim.findMany({ orderBy: { claimedAt: 'desc' }, take: 10 }),
      prisma.waste.findMany({ orderBy: { createdAt: 'desc' }, take: 10 })
    ]);

    res.json({ recentDonations, recentClaims, recentWaste });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Recent activity error', detail: err.message });
  }
};

// 5. Top Donors/NGOs by Food Donations
exports.getTopDonors = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const startDate = parseDate(req.query.startDate, new Date('2000-01-01'));
    const endDate = parseDate(req.query.endDate, new Date());

    const total = await prisma.food.aggregate({
      where: { status: 'DONATED', createdAt: { gte: startDate, lte: endDate } },
      _sum: { quantity: true },
      _count: true,
    });

    const group = await prisma.food.groupBy({
      by: ['restaurantId'],
      where: { status: 'DONATED', createdAt: { gte: startDate, lte: endDate } },
      _count: true,
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit * 2,
    });

    const donors = [];
    for (const donor of group) {
      const user = await prisma.user.findUnique({
        where: { id: donor.restaurantId },
        select: { id: true, name: true, role: true },
      });

      if (!user) continue;

      donors.push({
        name: user.name,
        role: user.role,
        quantity: donor._sum.quantity || 0,
        count: donor._count._all,
        percentage: ((donor._sum.quantity / (total._sum.quantity || 1)) * 100).toFixed(2) + '%'
      });

      if (donors.length === limit) break;
    }

    res.json({
      totalDonations: total._count,
      totalQuantity: total._sum.quantity || 0,
      topDonors: donors
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Top donors error', detail: err.message });
  }
};


// 6. Monthly Stats (for charts)
exports.getMonthlyStats = async (req, res) => {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") AS month,
        COUNT(*) as total
      FROM "Food"
      GROUP BY month
      ORDER BY month;
    `;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Monthly stats error', detail: err.message });
  }
};

// 7. Export User Report (CSV)
exports.downloadUsersCSV = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    const fields = ['id', 'name', 'email', 'role', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(users);

    res.header('Content-Type', 'text/csv');
    res.attachment('users_report.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'CSV export error', detail: err.message });
  }
};
// 8. Weekly Donations (with optional date range)
exports.getWeeklyDonations = async (req, res) => {
  try {
    const { start, end } = req.query;

    const fromDate = start ? new Date(start) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const toDate = end ? new Date(end) : new Date();

    const donations = await prisma.food.findMany({
      where: {
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Group by day
    const grouped = {};
    donations.forEach(({ createdAt }) => {
      const day = createdAt.toISOString().split('T')[0];
      grouped[day] = (grouped[day] || 0) + 1;
    });

    const result = Object.entries(grouped).map(([date, count]) => ({
      date,
      count,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error getting donations', detail: err.message });
  }
};

// 9. Top Donors (with optional limit)
exports.getTopUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const topUsers = await prisma.food.groupBy({
      by: ['donorId'],
      _count: {
        donorId: true,
      },
      orderBy: {
        _count: {
          donorId: 'desc',
        },
      },
      take: limit,
    });

    const userData = await Promise.all(topUsers.map(async (u) => {
      const user = await prisma.user.findUnique({
        where: { id: u.donorId },
        select: { id: true, name: true, email: true },
      });
      return {
        ...user,
        donations: u._count.donorId,
      };
    }));

    res.json(userData);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching top users', detail: err.message });
  }
};
// 10. Donations By Location (optionally filter by status or date range)
exports.getStatsByLocation = async (req, res) => {
  try {
    const { start, end, status } = req.query;

    const where = {};
    if (start || end) {
      where.createdAt = {};
      if (start) where.createdAt.gte = new Date(start);
      if (end) where.createdAt.lte = new Date(end);
    }
    if (status) {
      where.status = status.toUpperCase();
    }

    const foods = await prisma.food.findMany({
      where,
      select: {
        location: true,
      },
    });

    const locationCount = {};
    foods.forEach(({ location }) => {
      if (location) {
        locationCount[location] = (locationCount[location] || 0) + 1;
      }
    });

    const result = Object.entries(locationCount).map(([location, count]) => ({
      location,
      count,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching stats by location', detail: err.message });
  }
};

let dashboardConfig = {
  permanentWidgets: ['weekly-donations', 'top-users'],
  optionalWidgets: ['location-stats'],
};

exports.getDashboardConfig = (req, res) => {
  res.json(dashboardConfig);
};

exports.updateDashboardConfig = (req, res) => {
  const { add, remove } = req.body;

  if (add && !dashboardConfig.permanentWidgets.includes(add)) {
    if (!dashboardConfig.optionalWidgets.includes(add)) {
      return res.status(400).json({ error: 'Invalid widget name' });
    }
    dashboardConfig.permanentWidgets.push(add);
  }

  if (remove && dashboardConfig.permanentWidgets.includes(remove)) {
    dashboardConfig.permanentWidgets = dashboardConfig.permanentWidgets.filter(w => w !== remove);
  }

  res.json({ message: 'Dashboard config updated', config: dashboardConfig });
};


