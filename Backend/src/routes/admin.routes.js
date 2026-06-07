/**
 * @file src/routes/admin.routes.js
 * @description Admin verification routes
 */

const express = require("express")
const router = express.Router()

const {
    verifyToken,
    authorizeRoles,
} = require("../middlewares/auth.middleware")

const {
    getPendingUsersController,
    approveUserController,
    rejectUserController,
    getAllUsersController,
} = require("../controllers/admin.controller")

const { getAdminStatsController } = require("../controllers/payment.controller")

// ─── Stats ────────────────────────────────────────────────
router.get(
    "/stats",
    verifyToken,
    authorizeRoles("admin"),
    getAdminStatsController
)

// ─── All Users ────────────────────────────────────────────
router.get(
    "/users",
    verifyToken,
    authorizeRoles("admin"),
    getAllUsersController
)

// ─── Pending Users ────────────────────────────────────────
router.get(
    "/pending-users",
    verifyToken,
    authorizeRoles("admin"),
    getPendingUsersController
)

// ─── Approve User ─────────────────────────────────────────
router.patch(
    "/users/:id/approve",
    verifyToken,
    authorizeRoles("admin"),
    approveUserController
)

// ─── Reject User ──────────────────────────────────────────
router.patch(
    "/users/:id/reject",
    verifyToken,
    authorizeRoles("admin"),
    rejectUserController
)

module.exports = router