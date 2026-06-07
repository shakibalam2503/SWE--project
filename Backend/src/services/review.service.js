const { getPool } = require('../config/db');

async function addReviewService({ propertyId, tenantId, rating, comment }) {
    const pool = getPool();
    const [result] = await pool.query(
        `INSERT INTO reviews (property_id, tenant_id, rating, comment) VALUES (?, ?, ?, ?)`,
        [propertyId, tenantId, rating, comment || null]
    );
    return { id: result.insertId };
}

async function getPropertyReviewsService(propertyId) {
    const pool = getPool();
    const [reviews] = await pool.query(
        `SELECT r.*, u.name as reviewer_name 
         FROM reviews r
         JOIN users u ON r.tenant_id = u.id
         WHERE r.property_id = ?
         ORDER BY r.created_at DESC`,
        [propertyId]
    );
    return reviews;
}

module.exports = {
    addReviewService,
    getPropertyReviewsService
};
