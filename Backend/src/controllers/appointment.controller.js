const { scheduleAppointmentService, getTenantAppointmentsService, getOwnerAppointmentsService } = require('../services/appointment.service');

async function scheduleAppointmentController(req, res, next) {
    try {
        const tenantId = req.user.id;
        const { propertyId, scheduledDate, scheduledTime, message } = req.body;

        if (!propertyId || !scheduledDate || !scheduledTime) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const appointment = await scheduleAppointmentService({ propertyId, tenantId, scheduledDate, scheduledTime, message });
        res.status(201).json({ success: true, message: 'Appointment scheduled successfully', appointment });
    } catch (err) {
        next(err);
    }
}

async function getMyAppointmentsController(req, res, next) {
    try {
        const tenantId = req.user.id;
        const appointments = await getTenantAppointmentsService(tenantId);
        res.json({ success: true, appointments });
    } catch (err) {
        next(err);
    }
}

async function getOwnerAppointmentsController(req, res, next) {
    try {
        const ownerId = req.user.id;
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        const appointments = await getOwnerAppointmentsService(ownerId);
        res.json({ success: true, appointments });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    scheduleAppointmentController,
    getMyAppointmentsController,
    getOwnerAppointmentsController
};
