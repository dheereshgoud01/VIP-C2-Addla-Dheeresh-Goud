const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');

// Apply to become a doctor
exports.applyDoctor = async (req, res) => {
  try {
    const { userId, name, specialization, availability, fees } = req.body;

    let targetUserId = userId;

    // If userId is not provided (e.g. from user dashboard), find or create a user account for them
    if (!targetUserId) {
      // Find user by name
      let user = await User.findOne({ name });
      if (user) {
        targetUserId = user._id;
        // Update role to doctor since they are applying to be one
        user.role = 'doctor';
        await user.save();
      } else {
        // Create a placeholder user account so the doctor can log in later
        const email = name.toLowerCase().replace(/\s+/g, '') + '@doctor.com';
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('123456', salt); // Default password for applications

        user = new User({
          name,
          email,
          password: passwordHash,
          role: 'doctor'
        });
        await user.save();
        targetUserId = user._id;
      }
    } else {
      // If userId is provided, make sure their role is updated to doctor
      const user = await User.findById(targetUserId);
      if (user && user.role !== 'doctor') {
        user.role = 'doctor';
        await user.save();
      }
    }

    // Check if doctor profile already exists for this user
    let doctor = await Doctor.findOne({ userId: targetUserId });
    if (doctor) {
      // Update existing application
      doctor.name = name;
      doctor.specialization = specialization;
      doctor.availability = availability;
      doctor.fees = fees;
      doctor.status = 'pending'; // Reset status to pending for admin re-approval
      await doctor.save();
    } else {
      // Create new doctor profile
      doctor = new Doctor({
        userId: targetUserId,
        name,
        specialization,
        availability,
        fees,
        status: 'pending'
      });
      await doctor.save();
    }

    return res.status(201).json(doctor);

  } catch (error) {
    console.error('Apply doctor error:', error);
    return res.status(500).json({ message: 'Unable to submit doctor application.' });
  }
};

// List all doctors (pending and approved)
exports.listDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    return res.status(200).json(doctors);
  } catch (error) {
    console.error('List doctors error:', error);
    return res.status(500).json({ message: 'Unable to fetch doctors list.' });
  }
};

// Get doctor profile by userId
exports.getDoctorProfileByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const doctor = await Doctor.findOne({ userId });

    if (!doctor) {
      // Frontend expects a 404 error if profile does not exist to show creation form
      return res.status(404).json({ message: 'Doctor profile not found.' });
    }

    return res.status(200).json(doctor);
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Unable to load profile.' });
  }
};

// Update doctor profile (availability, fees)
exports.updateDoctorProfile = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { availability, fees } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found.' });
    }

    doctor.availability = availability;
    doctor.fees = fees;
    await doctor.save();

    return res.status(200).json(doctor);
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Unable to update profile.' });
  }
};

// Book an appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { userId, doctorId, userName, doctorName, date, time } = req.body;

    if (!userId || !doctorId || !userName || !doctorName || !date || !time) {
      return res.status(400).json({ message: 'Missing required fields for booking.' });
    }

    const appointment = new Appointment({
      userId,
      doctorId,
      userName,
      doctorName,
      date: new Date(date),
      time,
      status: 'pending'
    });

    await appointment.save();
    return res.status(201).json(appointment);
  } catch (error) {
    console.error('Book appointment error:', error);
    return res.status(500).json({ message: 'Booking failed. Please try again.' });
  }
};

// Get appointment history for a patient
exports.getAppointmentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await Appointment.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json(history);
  } catch (error) {
    console.error('Get user history error:', error);
    return res.status(500).json({ message: 'Unable to retrieve appointments.' });
  }
};

// Get appointment history for a doctor
exports.getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const history = await Appointment.find({ doctorId }).sort({ createdAt: -1 });
    return res.status(200).json(history);
  } catch (error) {
    console.error('Get doctor history error:', error);
    return res.status(500).json({ message: 'Unable to retrieve appointments.' });
  }
};

// Get all appointments in the system (Admin feature)
exports.getAppointmentsAdmin = async (req, res) => {
  try {
    const history = await Appointment.find({}).sort({ createdAt: -1 });
    return res.status(200).json(history);
  } catch (error) {
    console.error('Get admin history error:', error);
    return res.status(500).json({ message: 'Unable to retrieve all appointments.' });
  }
};

// Update appointment status (approve, decline/cancel, complete)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    appointment.status = status;
    await appointment.save();

    return res.status(200).json(appointment);
  } catch (error) {
    console.error('Update appointment status error:', error);
    return res.status(500).json({ message: 'Unable to update appointment.' });
  }
};

// Approve doctor profile (Admin feature)
exports.approveDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found.' });
    }

    doctor.status = 'approved';
    await doctor.save();

    // Ensure the associated user has the doctor role
    const user = await User.findById(doctor.userId);
    if (user && user.role !== 'doctor') {
      user.role = 'doctor';
      await user.save();
    }

    return res.status(200).json({ message: 'Doctor approved successfully.', doctor });
  } catch (error) {
    console.error('Approve doctor error:', error);
    return res.status(500).json({ message: 'Failed to approve doctor.' });
  }
};

// Delete a doctor profile (Admin feature)
exports.deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findByIdAndDelete(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found.' });
    }

    // Demote the associated user back to patient/user role
    const user = await User.findById(doctor.userId);
    if (user && user.role === 'doctor') {
      user.role = 'user';
      await user.save();
    }

    // Delete appointments for this doctor profile
    await Appointment.deleteMany({ doctorId });

    return res.status(200).json({ message: 'Doctor profile deleted successfully.' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    return res.status(500).json({ message: 'Failed to delete doctor profile.' });
  }
};

// Delete an appointment (Admin / User feature)
exports.deleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findByIdAndDelete(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    return res.status(200).json({ message: 'Appointment deleted successfully.' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    return res.status(500).json({ message: 'Failed to delete appointment.' });
  }
};

