# MediCareBook - Secure Doctor Appointments Web Application

MediCareBook is a complete, full-stack appointment booking system designed to connect patients with doctors. The project is built using React on the frontend and Node.js/Express/MongoDB on the backend, adhering to a classic MVC (Model-View-Controller) design pattern.

##  Key Features

* **Authentication System**: Secure registration and login for Patients, Doctors, and Administrators (using `bcryptjs` password hashing).
* **Patient Dashboard**:
  * View active, approved doctors.
  * Search and filter specialists by medical field or name.
  * Book appointment slots.
  * Track personal appointment history and status (pending/approved/completed/cancelled).
  * Apply to become a doctor in the system.
* **Doctor Dashboard**:
  * Manage consultation fees and availability times.
  * Accept, decline, or complete patient appointment requests.
  * Monitor statistics (pending requests, total completed bookings).
* **Admin Dashboard**:
  * Manage doctor verification applications.
  * Register new patient, doctor, or admin users directly.
  * View all registered accounts.
  * Delete user logins, active doctor listings, and appointment bookings (full cascading database cleanup).

---

##  Technology Stack

* **Frontend**: React, Tailwind CSS (Play CDN), Axios, Google Fonts (Plus Jakarta Sans)
* **Backend**: Node.js, Express, Mongoose (MongoDB Object Modeling)
* **Database**: MongoDB (Local Instance or Atlas)
* **Security**: Bcryptjs (Password Hashing)

---

##  Project Folder Structure

```
├── backend/
│   ├── config/              # Database connection setup
│   ├── controllers/         # Express controllers (authController, doctorController)
│   ├── models/              # Mongoose collection models (User, Doctor, Appointment)
│   ├── routes/              # Express Router paths (authRoutes, doctorRoutes)
│   ├── .env.example         # Template for environment variables
│   ├── index.js             # Main server execution entry point
│   ├── inspect_db.js        # Helper script to inspect DB collections
│   └── test_endpoints.js    # Integration test suite for APIs
├── frontend/
│   ├── src/
│   │   ├── components/      # React Dashboard and Auth pages
│   │   ├── app.jsx          # Client route controller
│   │   └── main.jsx         # React bootstrapping entry point
│   └── index.html           # Tailwind CDN & font loader
└── README.md
```

---

##  Running Locally

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed and a local instance of [MongoDB](https://www.mongodb.com/) running on port `27017`.

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Start the backend developer server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:8000`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite client dev server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`. Open this URL in your browser.

---

##  Testing the APIs
To run a clean verification check of the API lifecycle, navigate to the `backend/` folder and execute the test suite:
```bash
node test_endpoints.js
```
This will automatically clean up any existing test records and test all features: registering users, submitting profile applications, admin verification, booking slots, and finishing doctor appointments.
