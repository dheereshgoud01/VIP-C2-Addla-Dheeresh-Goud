const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/doctor';

const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

async function inspect() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected to MongoDB.');

    const userCount = await User.countDocuments();
    const doctorCount = await Doctor.countDocuments();
    const appointmentCount = await Appointment.countDocuments();

    console.log('\n=== Database Statistics ===');
    console.log(`- Total Registered Users: ${userCount}`);
    console.log(`- Total Doctor Profiles: ${doctorCount}`);
    console.log(`- Total Appointments Booked: ${appointmentCount}`);

    const users = await User.find({}).select('name email role');
    console.log('\n=== Registered Accounts ===');
    users.forEach(u => {
      console.log(`* ${u.name} (${u.email}) - Role: ${u.role}`);
    });

    const doctors = await Doctor.find({});
    console.log('\n=== Doctor Profiles ===');
    doctors.forEach(d => {
      console.log(`* ${d.name} - Specialization: ${d.specialization} - Status: ${d.status}`);
    });

    await mongoose.connection.close();
    console.log('\nInspection completed.');
  } catch (error) {
    console.error('Inspection failed:', error);
  }
}

inspect();
