import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard({ user, onLogout }) {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  // New user form states
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [createLoading, setCreateLoading] = useState(false);

  const refreshAdminData = async () => {
    try {
      const [doctorResponse, appointmentResponse, userResponse] = await Promise.all([
        axios.get('http://localhost:8000/api/doctors/list'),
        axios.get('http://localhost:8000/api/doctors/history/admin/all'),
        axios.get('http://localhost:8000/api/auth/users'),
      ]);
      setDoctors(doctorResponse.data);
      setAppointments(appointmentResponse.data);
      setUsers(userResponse.data);
    } catch (error) {
      console.error(error);
      setMessage('Unable to load admin data.');
    }
  };

  useEffect(() => {
    refreshAdminData();
  }, []);

  const approveDoctor = async (doctorId) => {
    setMessage('');
    try {
      await axios.put(`http://localhost:8000/api/doctors/approve/${doctorId}`);
      setMessage('Doctor approved successfully.');
      refreshAdminData();
    } catch (error) {
      console.error(error);
      setMessage('Failed to approve doctor.');
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    setMessage('');
    try {
      await axios.put(`http://localhost:8000/api/doctors/appointment/${appointmentId}`, { status });
      setMessage('Appointment status updated.');
      refreshAdminData();
    } catch (error) {
      console.error(error);
      setMessage('Unable to update appointment.');
    }
  };

  // Delete doctor profile
  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to delete this doctor profile? This will demote the user to patient and delete their appointments.')) return;
    setMessage('');
    try {
      await axios.delete(`http://localhost:8000/api/doctors/${doctorId}`);
      setMessage('Doctor profile deleted successfully.');
      refreshAdminData();
    } catch (error) {
      console.error(error);
      setMessage('Failed to delete doctor profile.');
    }
  };

  // Delete user account
  const handleDeleteUser = async (userId) => {
    if (userId === user._id) {
      alert('You cannot delete your own admin account!');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user? This will cascadingly delete all their appointments and profiles.')) return;
    setMessage('');
    try {
      await axios.delete(`http://localhost:8000/api/auth/user/${userId}`);
      setMessage('User deleted successfully.');
      refreshAdminData();
    } catch (error) {
      console.error(error);
      setMessage('Failed to delete user.');
    }
  };

  // Delete appointment record
  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment record?')) return;
    setMessage('');
    try {
      await axios.delete(`http://localhost:8000/api/doctors/appointment/${appointmentId}`);
      setMessage('Appointment deleted successfully.');
      refreshAdminData();
    } catch (error) {
      console.error(error);
      setMessage('Failed to delete appointment.');
    }
  };

  // Create new user (patient / doctor / admin)
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) {
      alert('Please fill out all fields.');
      return;
    }
    setCreateLoading(true);
    setMessage('');
    try {
      await axios.post('http://localhost:8000/api/auth/register', {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      });
      setMessage(`Successfully created new ${newUserRole}: ${newUserName}`);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('user');
      refreshAdminData();
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || 'Failed to create user.');
    } finally {
      setCreateLoading(false);
    }
  };

  const pendingDoctors = doctors.filter((doctor) => doctor.status === 'pending');
  const approvedDoctorsList = doctors.filter((doctor) => doctor.status === 'approved');

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-indigo-950 text-white shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-400">Admin dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold">Hello, {user.name}</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="rounded-full bg-indigo-900 px-4 py-2 text-sm font-semibold text-emerald-400">Administrator</span>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {message && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 shadow-sm">
            {message}
          </div>
        )}

        {/* Admin stats */}
        <section className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Pending doctors</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{pendingDoctors.length}</p>
            <p className="mt-2 text-sm text-slate-500">Profiles awaiting approval.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Approved doctors</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{approvedDoctorsList.length}</p>
            <p className="mt-2 text-sm text-slate-500">Active doctors in directory.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Users</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{users.length}</p>
            <p className="mt-2 text-sm text-slate-500">Registered accounts.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Appointments</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{appointments.length}</p>
            <p className="mt-2 text-sm text-slate-500">Total bookings recorded.</p>
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            {/* User List Panel */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">User accounts directory</h2>
              <p className="mt-2 text-sm text-slate-500">Manage all patient, doctor, and admin system logins.</p>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-[0.08em] text-xs">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-6 text-center text-slate-500">No users found.</td>
                      </tr>
                    ) : (
                      users.map((item) => (
                        <tr key={item._id}>
                          <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                          <td className="p-3 font-mono">{item.email}</td>
                          <td className="p-3">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${item.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : item.role === 'doctor' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-800'}`}>
                              {item.role === 'user' ? 'Patient' : item.role}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {item._id !== user._id && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(item._id)}
                                className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Approved Doctor Panel */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Approved doctors directory</h2>
              <p className="mt-2 text-sm text-slate-500">Monitor active specialists and manage their profiles.</p>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-[0.08em] text-xs">
                    <tr>
                      <th className="p-3">Doctor</th>
                      <th className="p-3">Specialty</th>
                      <th className="p-3">Availability</th>
                      <th className="p-3">Fee</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {approvedDoctorsList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-6 text-center text-slate-500">No active doctors.</td>
                      </tr>
                    ) : (
                      approvedDoctorsList.map((doctor) => (
                        <tr key={doctor._id}>
                          <td className="p-3 font-semibold text-slate-900">{doctor.name}</td>
                          <td className="p-3">{doctor.specialization}</td>
                          <td className="p-3">{doctor.availability}</td>
                          <td className="p-3">₹{doctor.fees}</td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteDoctor(doctor._id)}
                              className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition"
                            >
                              Delete Profile
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Doctor approval queue */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Doctor approval queue</h2>
                  <p className="mt-2 text-sm text-slate-500">Review and approve new doctor applications.</p>
                </div>
                <button
                  type="button"
                  onClick={refreshAdminData}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Refresh data
                </button>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-[0.08em] text-xs">
                    <tr>
                      <th className="p-3">Doctor</th>
                      <th className="p-3">Specialty</th>
                      <th className="p-3">Availability</th>
                      <th className="p-3">Fee</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {pendingDoctors.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-6 text-center text-slate-500">No pending doctor requests.</td>
                      </tr>
                    ) : (
                      pendingDoctors.map((doctor) => (
                        <tr key={doctor._id}>
                          <td className="p-3 font-semibold text-slate-900">{doctor.name}</td>
                          <td className="p-3">{doctor.specialization}</td>
                          <td className="p-3">{doctor.availability}</td>
                          <td className="p-3">₹{doctor.fees}</td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => approveDoctor(doctor._id)}
                              className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-semibold text-white hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            {/* Create New User Panel */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Create new account</h2>
              <p className="mt-2 text-sm text-slate-500">Instantly register users, doctors, or admins.</p>
              
              <form onSubmit={handleCreateUser} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Full name</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Dr. Emily Watson / John Watson"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Email address</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="emily@test.com"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Password</label>
                  <input
                    type="password"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Account role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500"
                  >
                    <option value="user">Patient (User)</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-75"
                >
                  {createLoading ? 'Registering...' : 'Register Account'}
                </button>
              </form>
            </div>
          </aside>
        </section>

        {/* Appointment ledger */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Appointment ledger</h2>
          <p className="mt-2 text-sm text-slate-500">Manage status updates and remove booking records.</p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-[0.08em] text-xs">
                <tr>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Doctor</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-slate-500">No appointments recorded.</td>
                  </tr>
                ) : (
                  appointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td className="p-3 font-semibold text-slate-900">{appointment.userName}</td>
                      <td className="p-3">{appointment.doctorName}</td>
                      <td className="p-3 font-mono">
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })} at {appointment.time}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${appointment.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : appointment.status === 'completed' ? 'bg-indigo-100 text-indigo-800' : appointment.status === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="p-3 flex flex-wrap gap-2">
                        {appointment.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => updateAppointmentStatus(appointment._id, 'approved')}
                            className="rounded-full bg-indigo-600 px-3 py-1 text-sm font-semibold text-white hover:bg-indigo-700"
                          >
                            Approve
                          </button>
                        )}
                        {appointment.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                            className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white hover:bg-slate-800"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteAppointment(appointment._id)}
                          className="rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-600 hover:bg-rose-100"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
