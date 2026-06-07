const { getPool } = require('../config/db');

async function scheduleAppointmentService({ propertyId, tenantId, scheduledDate, scheduledTime, message }) {
    const pool = getPool();
    
    // Get the owner of the property
    const [[property]] = await pool.query(`SELECT owner_id FROM properties WHERE id = ?`, [propertyId]);
    if (!property) {
        throw new Error('Property not found');
    }

    const [result] = await pool.query(
        `INSERT INTO visit_appointments (property_id, tenant_id, owner_id, scheduled_date, scheduled_time, message)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [propertyId, tenantId, property.owner_id, scheduledDate, scheduledTime, message || null]
    );

    return { id: result.insertId };
}

async function getTenantAppointmentsService(tenantId) {
    const pool = getPool();
    const [appointments] = await pool.query(
        `SELECT a.*, p.title as property_title, u.name as owner_name
         FROM visit_appointments a
         JOIN properties p ON a.property_id = p.id
         JOIN users u ON a.owner_id = u.id
         WHERE a.tenant_id = ?
         ORDER BY a.created_at DESC`,
        [tenantId]
    );
    return appointments;
}

async function getOwnerAppointmentsService(ownerId) {
    const pool = getPool();
    const [appointments] = await pool.query(
        `SELECT a.*, p.title as property_title, u.name as tenant_name, u.phone as tenant_phone
         FROM visit_appointments a
         JOIN properties p ON a.property_id = p.id
         JOIN users u ON a.tenant_id = u.id
         WHERE a.owner_id = ?
         ORDER BY a.created_at DESC`,
        [ownerId]
    );
    return appointments;
}

module.exports = {
    scheduleAppointmentService,
    getTenantAppointmentsService,
    getOwnerAppointmentsService
};
