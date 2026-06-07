const express = require('express');
const router = express.Router({ mergeParams: true });
const { verifyToken } = require('../middlewares/auth.middleware');
const { addReviewController, getPropertyReviewsController } = require('../controllers/review.controller');

// POST /api/properties/:id/reviews
router.post('/', verifyToken, addReviewController);

// GET /api/properties/:id/reviews
router.get('/', getPropertyReviewsController);

module.exports = router;
