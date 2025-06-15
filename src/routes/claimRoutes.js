const express = require('express');
const router = express.Router();
const {
  getAvailableFoods,
  requestClaim,
  myClaims,
} = require('../controllers/claimController');

const { protect, restrictTo } = require('../middlewares/authMiddleware');

// NGOs and Users can access
router.get('/available', protect, restrictTo('NGO', 'USER'), getAvailableFoods);
router.post('/request', protect, restrictTo('NGO', 'USER'), requestClaim);
router.get('/my-claims', protect, restrictTo('NGO', 'USER'), myClaims);

module.exports = router;
