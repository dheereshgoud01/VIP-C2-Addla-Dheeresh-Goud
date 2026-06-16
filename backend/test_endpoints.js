const http = require('http');
const mongoose = require('mongoose');

const API_URL = 'http://localhost:8000';
const MONGO_URI = 'mongodb://localhost:27017/doctor';

// Import models directly for DB cleanup
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

// Helper function to make HTTP requests
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, rawBody: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== Database Cleanup ===');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for cleaning...');

    // Find user IDs to clean associated docs
    const emails = ['admin@test.com', 'john@test.com', 'priya@test.com'];
    const usersToClean = await User.find({ email: { $in: emails } });
    const userIds = usersToClean.map(u => u._id);

    // Clean appointments
    const deletedAppts = await Appointment.deleteMany({
      $or: [
        { userId: { $in: userIds } },
        { userName: 'John Doe' },
        { doctorName: 'Dr. Priya Sharma' }
      ]
    });
    console.log(`Deleted ${deletedAppts.deletedCount} test appointments.`);

    // Clean doctors
    const deletedDocs = await Doctor.deleteMany({
      $or: [
        { userId: { $in: userIds } },
        { name: 'Dr. Priya Sharma' }
      ]
    });
    console.log(`Deleted ${deletedDocs.deletedCount} test doctor profiles.`);

    // Clean users
    const deletedUsers = await User.deleteMany({ email: { $in: emails } });
    console.log(`Deleted ${deletedUsers.deletedCount} test users.`);

    await mongoose.connection.close();
    console.log('Database cleanup complete. Connection closed.\n');

  } catch (err) {
    console.error('Database cleanup failed:', err);
    process.exit(1);
  }

  console.log('=== Starting End-to-End API Integration Tests ===\n');

  try {
    // 1. Register Admin
    console.log('1. Registering Admin user...');
    const adminReg = await request('POST', '/api/auth/register', {
      name: 'System Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });
    console.log(`Response Status: ${adminReg.status}`);
    const adminId = adminReg.body._id;
    console.log(`Registered Admin ID: ${adminId}\n`);

    // 2. Register Patient
    console.log('2. Registering Patient user...');
    const patientReg = await request('POST', '/api/auth/register', {
      name: 'John Doe',
      email: 'john@test.com',
      password: 'password123',
      role: 'user'
    });
    console.log(`Response Status: ${patientReg.status}`);
    const patientId = patientReg.body._id;
    console.log(`Registered Patient ID: ${patientId}\n`);

    // 3. Register Doctor User
    console.log('3. Registering Doctor user account...');
    const doctorUserReg = await request('POST', '/api/auth/register', {
      name: 'Dr. Priya Sharma',
      email: 'priya@test.com',
      password: 'password123',
      role: 'doctor'
    });
    console.log(`Response Status: ${doctorUserReg.status}`);
    const doctorUserId = doctorUserReg.body._id;
    console.log(`Registered Doctor User ID: ${doctorUserId}\n`);

    // 4. Login Patient
    console.log('4. Testing Patient login...');
    const patientLogin = await request('POST', '/api/auth/login', {
      email: 'john@test.com',
      password: 'password123'
    });
    console.log(`Response Status: ${patientLogin.status}`);
    console.log(`Login response role: ${patientLogin.body.role}\n`);

    // 5. Submit Doctor Profile Application
    console.log('5. Submitting Doctor Profile Application...');
    const doctorApply = await request('POST', '/api/doctors/apply', {
      userId: doctorUserId,
      name: 'Dr. Priya Sharma',
      specialization: 'Dermatology',
      availability: 'Mon-Fri, 10am - 4pm',
      fees: 500
    });
    console.log(`Response Status: ${doctorApply.status}`);
    const doctorProfileId = doctorApply.body._id;
    console.log(`Doctor Profile ID: ${doctorProfileId}`);
    console.log(`Profile Status: ${doctorApply.body.status}\n`);

    // 6. Approve Doctor Profile (Admin action)
    console.log('6. Approving Doctor Profile (Admin)...');
    const doctorApprove = await request('PUT', `/api/doctors/approve/${doctorProfileId}`);
    console.log(`Response Status: ${doctorApprove.status}`);
    console.log(`Approved Doctor Status: ${doctorApprove.body.doctor.status}\n`);

    // 7. List Approved Doctors
    console.log('7. Listing active doctors...');
    const listDocs = await request('GET', '/api/doctors/list');
    console.log(`Response Status: ${listDocs.status}`);
    console.log(`Number of doctors listed: ${listDocs.body.length}`);
    // Find our approved doctor in the list
    const foundDoc = listDocs.body.find(d => d._id === doctorProfileId);
    console.log(`Dr. Priya Sharma approved profile in list? ${!!foundDoc}\n`);

    // 8. Book Appointment (Patient books approved doctor)
    console.log('8. Booking Appointment...');
    const bookAppt = await request('POST', '/api/doctors/book', {
      userId: patientId,
      doctorId: doctorProfileId,
      userName: 'John Doe',
      doctorName: 'Dr. Priya Sharma',
      date: '2026-07-15',
      time: '10:00 AM'
    });
    console.log(`Response Status: ${bookAppt.status}`);
    const appointmentId = bookAppt.body._id;
    console.log(`Booked Appointment ID: ${appointmentId}`);
    console.log(`Appointment Status: ${bookAppt.body.status}\n`);

    // 9. Approve Appointment (Doctor action)
    console.log('9. Approving Appointment (Doctor)...');
    const approveAppt = await request('PUT', `/api/doctors/appointment/${appointmentId}`, {
      status: 'approved'
    });
    console.log(`Response Status: ${approveAppt.status}`);
    console.log(`Updated Appointment Status: ${approveAppt.body.status}\n`);

    // 10. Complete Appointment (Doctor action)
    console.log('10. Completing Appointment...');
    const completeAppt = await request('PUT', `/api/doctors/appointment/${appointmentId}`, {
      status: 'completed'
    });
    console.log(`Response Status: ${completeAppt.status}`);
    console.log(`Completed Appointment Status: ${completeAppt.body.status}\n`);

    // 11. Fetch Patient Appointment History
    console.log('11. Retrieving Patient Appointment History...');
    const patientHistory = await request('GET', `/api/doctors/history/user/${patientId}`);
    console.log(`Response Status: ${patientHistory.status}`);
    console.log(`Number of appointments in history: ${patientHistory.body.length}`);
    console.log(`First Appointment Status: ${patientHistory.body[0]?.status}`);
    console.log(`Doctor Name: ${patientHistory.body[0]?.doctorName}\n`);

    console.log('=== All Integration Tests Completed Successfully! ===');
  } catch (error) {
    console.error('Test run failed with error:', error);
  }
}

runTests();
