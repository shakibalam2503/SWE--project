const { addReviewService, getPropertyReviewsService } = require('../services/review.service');

async function addReviewController(req, res, next) {
    try {
        const tenantId = req.user.id;
        const { propertyId } = req.params;
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        const review = await addReviewService({ propertyId, tenantId, rating, comment });
        res.status(201).json({ success: true, message: 'Review added successfully', review });
    } catch (err) {
        next(err);
    }
}

async function getPropertyReviewsController(req, res, next) {
    try {
        const { propertyId } = req.params;
        const reviews = await getPropertyReviewsService(propertyId);
        res.json({ success: true, reviews });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    addReviewController,
    getPropertyReviewsController
};
