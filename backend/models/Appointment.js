const mongoose = require('mongoose');

// Appointment schema definition
const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  doctorName: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
