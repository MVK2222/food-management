const express = require('express');
const router = express.Router();
const {
  markWaste,
  viewAvailableWaste,
  requestWasteCollection,
  myRecyclerRequests,
} = require('../controllers/wasteController');

const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Restaurant marks waste
router.post('/mark', protect, restrictTo('RESTAURANT'), markWaste);

// Recycler access
router.get('/available', protect, restrictTo('RECYCLER'), viewAvailableWaste);
router.post('/request', protect, restrictTo('RECYCLER'), requestWasteCollection);
router.get('/my-requests', protect, restrictTo('RECYCLER'), myRecyclerRequests);

module.exports = router;
