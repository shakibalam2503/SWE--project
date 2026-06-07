const express = require("express");
const router = express.Router({ mergeParams: true });
const { getOwnerReviews, addOwnerReview } = require("../controllers/ownerReview.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// GET /api/owners/:ownerId/reviews (public)
router.get("/", getOwnerReviews);

// POST /api/owners/:ownerId/reviews (protected)
router.post("/", verifyToken, addOwnerReview);

module.exports = router;
