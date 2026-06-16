const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

// Doctor profile application and lists
router.post('/apply', doctorController.applyDoctor);
router.get('/list', doctorController.listDoctors);

// Doctor profile retrieval and updates
router.get('/profile/user/:userId', doctorController.getDoctorProfileByUser);
router.put('/profile/:doctorId', doctorController.updateDoctorProfile);

// Appointment bookings
router.post('/book', doctorController.bookAppointment);

// Booking history routes
router.get('/history/user/:userId', doctorController.getAppointmentsByUser);
router.get('/history/doctor/:doctorId', doctorController.getAppointmentsByDoctor);
router.get('/history/admin/all', doctorController.getAppointmentsAdmin);

// Appointment status update (approve/complete/cancel)
router.put('/appointment/:appointmentId', doctorController.updateAppointmentStatus);
router.delete('/appointment/:appointmentId', doctorController.deleteAppointment);

// Doctor approval queue (Admin feature)
router.put('/approve/:doctorId', doctorController.approveDoctor);
router.delete('/:doctorId', doctorController.deleteDoctor);

module.exports = router;
