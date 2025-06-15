const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getRecentActivities,
  getTopDonors,
  getMonthlyStats,
  downloadUsersCSV,
  getWeeklyDonations,
  getTopUsers,
  getStatsByLocation,
  getDashboardConfig,
  updateDashboardConfig
} = require('../controllers/adminController');

const { protect, restrictToAdmin } = require('../middlewares/authMiddleware');

// Dashboard routes
router.get('/dashboard', protect, restrictToAdmin, getDashboardStats);
router.get('/dashboard/config', protect, restrictToAdmin, getDashboardConfig);
router.post('/dashboard/config', protect, restrictToAdmin, updateDashboardConfig);

// User management
router.get('/users', protect, restrictToAdmin, getAllUsers);
router.delete('/user/:id', protect, restrictToAdmin, deleteUser);
router.get('/users/export', protect, restrictToAdmin, downloadUsersCSV);

// Analytics
router.get('/activities/recent', protect, restrictToAdmin, getRecentActivities);
router.get('/donors/top', protect, restrictToAdmin, getTopDonors);
router.get('/users/top', protect, restrictToAdmin, getTopUsers);
router.get('/stats/monthly', protect, restrictToAdmin, getMonthlyStats);
router.get('/donations/weekly', protect, restrictToAdmin, getWeeklyDonations);
router.get('/donations/location', protect, restrictToAdmin, getStatsByLocation);

module.exports = router;
