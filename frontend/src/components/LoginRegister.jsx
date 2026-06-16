import React, { useState } from 'react';
import axios from 'axios';

function LoginRegister({ onAuthSuccess, onBack }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [alert, setAlert] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForm = async (e) => {
    e.preventDefault();
    setAlert('');
    setLoading(true);

    const route = isRegister ? 'register' : 'login';
    const payload = isRegister ? { name, email, password, role } : { email, password };

    try {
      const res = await axios.post(`http://localhost:8000/api/auth/${route}`, payload);
      onAuthSuccess(res.data);
    } catch (err) {
      setAlert(err.response?.data?.message || 'Unable to complete authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-900">← Back to Home</button>

        <div className="mt-4">
          <h2 className="text-3xl font-bold text-slate-900">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isRegister ? 'Register as a patient or doctor to get started.' : 'Login to view your dashboard and manage appointments.'}
          </p>
        </div>

        {alert && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {alert}
          </div>
        )}

        <form onSubmit={handleForm} className="mt-6 space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-semibold text-slate-700">Full name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500"
              placeholder="Enter your password"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-semibold text-slate-700">Account type</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500"
              >
                <option value="user">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-70"
          >
            {isRegister ? 'Create account' : 'Log in'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="font-semibold text-emerald-600 hover:text-emerald-700"
          >
            {isRegister ? 'Already have an account? Log in' : 'Need an account? Register now'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginRegister;
