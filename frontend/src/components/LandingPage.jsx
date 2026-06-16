import React from 'react';

function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">MediCareBook</h1>
            <p className="text-sm text-slate-500">Connect patients with doctors — seamlessly.</p>
          </div>
          <button onClick={() => onNavigate('auth')} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700">
            Login / Register
          </button>
        </div>
      </header>

      <main className="flex-1 grid place-items-center px-6 py-12">
        <div className="max-w-4xl w-full space-y-10">
          <section className="rounded-3xl bg-white/90 border border-slate-200 shadow-xl p-10">
            <p className="uppercase text-sm font-semibold tracking-[0.3em] text-emerald-600">Healthcare Simplified</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Patients book, doctors manage — all in one place.
            </h2>
            <p className="mt-5 text-slate-600 text-base leading-7">
              MediCareBook is a complete appointment platform where patients find doctors and manage visits, while doctors schedule appointments and track their practice. Secure, simple, and built for modern healthcare.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button onClick={() => onNavigate('auth')} className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800">
                Get Started
              </button>
              <button onClick={() => onNavigate('auth')} className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                Sign Up as Doctor
              </button>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'For Patients', detail: 'Search doctors by specialty, book appointments, and manage your medical history.' },
              { label: 'For Doctors', detail: 'Accept appointment requests, manage your schedule, and grow your practice.' },
              { label: 'Secure & Simple', detail: 'Easy registration, secure login, and quick access to your dashboard.' },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">{item.label}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/90">
        <div className="max-w-7xl mx-auto px-6 py-4 text-xs text-slate-500 text-center">
          MediCareBook — Connecting patients and doctors through simple, secure appointments
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
