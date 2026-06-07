const { getPool } = require("../config/db");

// Get all reviews for a specific owner
const getOwnerReviews = async (req, res) => {
    try {
        const pool = getPool();
        const { ownerId } = req.params;

        const [reviews] = await pool.query(
            `SELECT r.*, u.name as reviewer_name 
             FROM owner_reviews r
             JOIN users u ON r.tenant_id = u.id
             WHERE r.owner_id = ?
             ORDER BY r.created_at DESC`,
            [ownerId]
        );

        res.json({
            success: true,
            reviews
        });
    } catch (err) {
        console.error("Error fetching owner reviews:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Add a review for a specific owner
const addOwnerReview = async (req, res) => {
    try {
        const pool = getPool();
        const { ownerId } = req.params;
        const { rating, comment } = req.body;
        const tenantId = req.user.id;
        const userRole = req.user.role;

        // Ensure user is a tenant
        if (userRole !== "tenant") {
            return res.status(403).json({ success: false, message: "Only tenants can review owners" });
        }

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Invalid rating. Must be between 1 and 5" });
        }

        // Ensure the owner exists
        const [[owner]] = await pool.query("SELECT * FROM users WHERE id = ? AND role = 'owner'", [ownerId]);
        if (!owner) {
            return res.status(404).json({ success: false, message: "Owner not found" });
        }

        await pool.query(
            "INSERT INTO owner_reviews (owner_id, tenant_id, rating, comment) VALUES (?, ?, ?, ?)",
            [ownerId, tenantId, rating, comment]
        );

        res.status(201).json({
            success: true,
            message: "Review added successfully"
        });
    } catch (err) {
        console.error("Error adding owner review:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = {
    getOwnerReviews,
    addOwnerReview
};
