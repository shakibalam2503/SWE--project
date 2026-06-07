/**
 * @file src/services/payment.service.js
 * @description Business logic for rent payment tracking.
 *              Handles bKash (tenant-initiated) and cash (owner-recorded) payments.
 */

const { getPool } = require('../config/db');

// ─── Record a bKash / Card Payment (Tenant) ──────────────────────────────────

/**
 * @name recordBkashPaymentService
 * @description Tenant records a bKash rent payment
 */
async function recordBkashPaymentService({ tenantId, propertyId, amount, paymentMonth, bkashNumber }) {
    const pool = getPool();

    // Verify property exists and tenant has an approved stay there
    const [[request]] = await pool.query(
        `SELECT sr.owner_id, sr.property_id, pr.monthly_rent
         FROM stay_requests sr
         JOIN properties pr ON sr.property_id = pr.id
         WHERE sr.property_id = ? AND sr.tenant_id = ? AND sr.status = 'approved'
         LIMIT 1`,
        [propertyId, tenantId]
    );

    if (!request) {
        const err = new Error('No approved stay found for this property.');
        err.statusCode = 403;
        throw err;
    }

    // Check for duplicate payment this month
    const [[existing]] = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments 
         WHERE property_id=? AND tenant_id=? AND payment_month=? AND status='completed'`,
        [propertyId, tenantId, paymentMonth]
    );
    
    if (existing && existing.total_paid >= request.monthly_rent) {
        const err = new Error('Rent already fully paid for this month.');
        err.statusCode = 409;
        throw err;
    }

    const txnId = 'BKS-' + Date.now() + '-' + Math.floor(Math.random() * 10000);

    const [result] = await pool.query(
        `INSERT INTO payments (property_id, tenant_id, owner_id, amount, payment_type, payment_month, transaction_id, notes, status)
         VALUES (?, ?, ?, ?, 'bkash', ?, ?, ?, 'completed')`,
        [propertyId, tenantId, request.owner_id, amount, paymentMonth, txnId, `bKash: ${bkashNumber}`]
    );

    return { id: result.insertId, transaction_id: txnId };
}

// ─── Record a Cash Payment (Owner) ───────────────────────────────────────────

/**
 * @name recordCashPaymentService
 * @description Owner records a cash payment received from tenant
 */
async function recordCashPaymentService({ ownerId, propertyId, tenantId, amount, paymentMonth, notes }) {
    const pool = getPool();

    // Verify the owner owns this property and retrieve monthly_rent
    const [[property]] = await pool.query(
        `SELECT id, monthly_rent FROM properties WHERE id = ? AND owner_id = ?`,
        [propertyId, ownerId]
    );

    if (!property) {
        const err = new Error('Property not found or you are not the owner.');
        err.statusCode = 403;
        throw err;
    }

    // Verify stay request is approved
    const [[stayRequest]] = await pool.query(
        `SELECT id FROM stay_requests 
         WHERE property_id = ? AND tenant_id = ? AND status = 'approved'`,
        [propertyId, tenantId]
    );

    if (!stayRequest) {
        const err = new Error('No approved stay found for this tenant.');
        err.statusCode = 400;
        throw err;
    }

    // Check for duplicate payment this month
    const [[existing]] = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments 
         WHERE property_id=? AND tenant_id=? AND payment_month=? AND status='completed'`,
        [propertyId, tenantId, paymentMonth]
    );

    const monthlyRent = parseFloat(property.monthly_rent || 0);
    const totalPaid = parseFloat(existing.total_paid || 0);

    if (totalPaid >= monthlyRent) {
        const err = new Error('Rent already fully paid for this month.');
        err.statusCode = 409;
        throw err;
    }

    const remaining = monthlyRent - totalPaid;
    if (amount > remaining) {
        const err = new Error(`Amount exceeds remaining rent of ৳${remaining.toLocaleString()}.`);
        err.statusCode = 400;
        throw err;
    }

    const [result] = await pool.query(
        `INSERT INTO payments (property_id, tenant_id, owner_id, amount, payment_type, payment_month, notes, status)
         VALUES (?, ?, ?, ?, 'cash', ?, ?, 'completed')`,
        [propertyId, tenantId, ownerId, amount, paymentMonth, notes || null]
    );

    return { id: result.insertId };
}

// ─── Get Tenant Payment History ───────────────────────────────────────────────

/**
 * @name getTenantPaymentsService
 * @description Get all payments made by a tenant
 */
async function getTenantPaymentsService(tenantId) {
    const pool = getPool();

    const [payments] = await pool.query(
        `SELECT p.*, pr.title as property_title, pr.area, pr.monthly_rent,
                u.name as owner_name
         FROM payments p
         JOIN properties pr ON p.property_id = pr.id
         JOIN users u ON p.owner_id = u.id
         WHERE p.tenant_id = ?
         ORDER BY p.paid_at DESC`,
        [tenantId]
    );

    return payments;
}

// ─── Get Owner Payment History ────────────────────────────────────────────────

/**
 * @name getOwnerPaymentsService
 * @description Get all payments received by an owner (both cash and bKash)
 */
async function getOwnerPaymentsService(ownerId) {
    const pool = getPool();

    const [payments] = await pool.query(
        `SELECT p.*, pr.title as property_title, pr.area, pr.monthly_rent,
                u.name as tenant_name, u.phone as tenant_phone, u.email as tenant_email
         FROM payments p
         JOIN properties pr ON p.property_id = pr.id
         JOIN users u ON p.tenant_id = u.id
         WHERE p.owner_id = ?
         ORDER BY p.paid_at DESC`,
        [ownerId]
    );

    return payments;
}

// ─── Get Owner Payment Stats ──────────────────────────────────────────────────

/**
 * @name getOwnerPaymentStatsService
 * @description Get summary stats for owner's payments
 */
async function getOwnerPaymentStatsService(ownerId) {
    const pool = getPool();

    const [[stats]] = await pool.query(
        `SELECT
            COUNT(*) as total_payments,
            SUM(amount) as total_collected,
            SUM(CASE WHEN payment_type = 'cash' THEN amount ELSE 0 END) as cash_total,
            SUM(CASE WHEN payment_type = 'bkash' THEN amount ELSE 0 END) as bkash_total,
            COUNT(CASE WHEN MONTH(paid_at) = MONTH(NOW()) AND YEAR(paid_at) = YEAR(NOW()) THEN 1 END) as this_month_count,
            SUM(CASE WHEN MONTH(paid_at) = MONTH(NOW()) AND YEAR(paid_at) = YEAR(NOW()) THEN amount ELSE 0 END) as this_month_total
         FROM payments
         WHERE owner_id = ?`,
        [ownerId]
    );

    return stats;
}

// ─── Admin Stats ──────────────────────────────────────────────────────────────

/**
 * @name getAdminStatsService
 * @description Returns platform-wide stats for the admin dashboard
 */
async function getAdminStatsService() {
    const pool = getPool();

    const [[userStats]] = await pool.query(`
        SELECT
            COUNT(*) as total_users,
            SUM(CASE WHEN role = 'tenant' THEN 1 ELSE 0 END) as total_tenants,
            SUM(CASE WHEN role = 'owner' THEN 1 ELSE 0 END) as total_owners,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_verifications,
            SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as verified_users
        FROM users WHERE role != 'admin'
    `);

    const [[propertyStats]] = await pool.query(`
        SELECT
            COUNT(*) as total_properties,
            SUM(CASE WHEN visibility_status = 'active' THEN 1 ELSE 0 END) as active_listings,
            SUM(CASE WHEN visibility_status = 'hidden' THEN 1 ELSE 0 END) as rented_out
        FROM properties
    `);

    const [[requestStats]] = await pool.query(`
        SELECT
            COUNT(*) as total_requests,
            SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
        FROM stay_requests
    `);

    return { userStats, propertyStats, requestStats };
}

module.exports = {
    recordBkashPaymentService,
    recordCashPaymentService,
    getTenantPaymentsService,
    getOwnerPaymentsService,
    getOwnerPaymentStatsService,
    getAdminStatsService,
};
