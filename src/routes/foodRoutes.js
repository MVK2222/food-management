const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { createFood } = require('../controllers/foodController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Only restaurants can post food
router.post('/create', protect, restrictTo('RESTAURANT'), upload.single('image'), createFood);

/**
 * @swagger
 * tags:
 *   name: Food
 *   description: Food listing and management (Restaurant only)
 */

/**
 * @swagger
 * /api/food:
 *   post:
 *     summary: Create a new food listing
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, quantity, expiresAt]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               quantity:
 *                 type: number
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Food item created
 */

const { getAllFoods } = require('../controllers/foodController');

// New public route or protected route
router.get('/', protect, getAllFoods);

module.exports = router;



