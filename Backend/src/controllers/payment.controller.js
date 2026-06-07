/**
 * @file src/controllers/payment.controller.js
 * @description Controller for payment management endpoints.
 */

const {
    recordBkashPaymentService,
    recordCashPaymentService,
    getTenantPaymentsService,
    getOwnerPaymentsService,
    getOwnerPaymentStatsService,
    getAdminStatsService,
} = require('../services/payment.service');

async function recordBkashPaymentController(req, res) {
    try {
        const tenantId = req.user.id;
        const { propertyId, amount, paymentMonth, bkashNumber } = req.body;

        if (!propertyId || !amount || !paymentMonth || !bkashNumber) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const result = await recordBkashPaymentService({
            tenantId,
            propertyId,
            amount: parseFloat(amount),
            paymentMonth,
            bkashNumber,
        });

        return res.status(201).json({ message: 'Payment recorded successfully.', payment: result });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ message: err.message || 'Internal server error.' });
    }
}

async function recordCashPaymentController(req, res) {
    try {
        const ownerId = req.user.id;
        const { propertyId, tenantId, amount, paymentMonth, notes } = req.body;

        if (!propertyId || !tenantId || !amount || !paymentMonth) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const result = await recordCashPaymentService({
            ownerId,
            propertyId,
            tenantId,
            amount: parseFloat(amount),
            paymentMonth,
            notes,
        });

        return res.status(201).json({ message: 'Cash payment recorded.', payment: result });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ message: err.message || 'Internal server error.' });
    }
}

async function getTenantPaymentsController(req, res) {
    try {
        const tenantId = req.user.id;
        const payments = await getTenantPaymentsService(tenantId);
        return res.status(200).json({ payments });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ message: err.message || 'Internal server error.' });
    }
}

async function getOwnerPaymentsController(req, res) {
    try {
        const ownerId = req.user.id;
        const [payments, stats] = await Promise.all([
            getOwnerPaymentsService(ownerId),
            getOwnerPaymentStatsService(ownerId),
        ]);
        return res.status(200).json({ payments, stats });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ message: err.message || 'Internal server error.' });
    }
}

async function getAdminStatsController(req, res) {
    try {
        const stats = await getAdminStatsService();
        return res.status(200).json(stats);
    } catch (err) {
        return res.status(err.statusCode || 500).json({ message: err.message || 'Internal server error.' });
    }
}

module.exports = {
    recordBkashPaymentController,
    recordCashPaymentController,
    getTenantPaymentsController,
    getOwnerPaymentsController,
    getAdminStatsController,
};
