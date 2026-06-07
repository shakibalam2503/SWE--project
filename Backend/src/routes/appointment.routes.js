const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const {
    scheduleAppointmentController,
    getMyAppointmentsController,
    getOwnerAppointmentsController
} = require('../controllers/appointment.controller');

router.post('/', verifyToken, scheduleAppointmentController);
router.get('/my', verifyToken, getMyAppointmentsController);
router.get('/owner', verifyToken, getOwnerAppointmentsController);

module.exports = router;
