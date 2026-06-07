/**
 * @file src/services/admin.service.js
 * @description Business logic for admin verification system
 */

const { getPool } = require("../config/db")
const { sendApprovalEmail } = require("./email.service")

/**
 * @name getPendingUsersService
 * @description Get all pending users
 */
async function getPendingUsersService() {
    const pool = getPool()

    const [rows] = await pool.query(`
        SELECT
            id,
            name,
            email,
            phone,
            role,
            nid_front_url,
            nid_back_url,
            status,
            is_verified,
            created_at
        FROM users
        WHERE status = 'pending'
        ORDER BY created_at DESC
    `)

    return rows
}

/**
 * @name approveUserService
 * @description Approve user account
 */
async function approveUserService(userId) {
    const pool = getPool()

    // Get user first
    const [users] = await pool.query(
        "SELECT name, email FROM users WHERE id=?",
        [userId]
    )

    if (users.length === 0) {
        const error = new Error("User not found.")
        error.statusCode = 404
        throw error
    }

    const user = users[0]

    // Update status
    await pool.query(
        `
        UPDATE users
        SET status = 'accepted',
            is_verified = TRUE
        WHERE id = ?
        `,
        [userId]
    )

    // Send approval email
    await sendApprovalEmail(user.email, user.name)
}

/**
 * @name rejectUserService
 * @description Reject user account
 */
async function rejectUserService(userId) {
    const pool = getPool()

    const [result] = await pool.query(
        `
        UPDATE users
        SET status = 'rejected',
            is_verified = FALSE
        WHERE id = ?
        `,
        [userId]
    )

    if (result.affectedRows === 0) {
        const error = new Error("User not found.")
        error.statusCode = 404
        throw error
    }
}

/**
 * @name getAllUsersService
 * @description Get all non-admin users for admin User Management page
 */
async function getAllUsersService() {
    const pool = getPool()

    const [rows] = await pool.query(`
        SELECT
            id, name, email, phone, role, status, is_verified, created_at
        FROM users
        WHERE role != 'admin'
        ORDER BY created_at DESC
    `)

    return rows
}

module.exports = {
    getPendingUsersService,
    getAllUsersService,
    approveUserService,
    rejectUserService,
}