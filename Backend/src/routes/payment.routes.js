/**
 * @file src/routes/payment.routes.js
 * @description Payment routes for tenant bKash, owner cash, and history
 */

const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');

const {
    recordBkashPaymentController,
    recordCashPaymentController,
    getTenantPaymentsController,
    getOwnerPaymentsController,
    getAdminStatsController,
} = require('../controllers/payment.controller');

// Tenant: pay via bKash
router.post('/bkash', verifyToken, authorizeRoles('tenant'), recordBkashPaymentController);

// Owner: record cash payment
router.post('/cash', verifyToken, authorizeRoles('owner'), recordCashPaymentController);

// Tenant: view own payment history
router.get('/my', verifyToken, authorizeRoles('tenant'), getTenantPaymentsController);

// Owner: view received payments + stats
router.get('/owner', verifyToken, authorizeRoles('owner'), getOwnerPaymentsController);

// Admin: platform stats
router.get('/admin/stats', verifyToken, authorizeRoles('admin'), getAdminStatsController);

module.exports = router;
