# 🌾 Smart Farm Management System (SFMS)

A professional, full-stack web application designed to support small-scale farmers in Rwanda. SFMS enables farmers to digitize their farm data, track crop growth cycles, log field activities, receive automated weather alerts, and collaborate with government-assigned Agricultural Extension Officers.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Default Credentials](#default-credentials)
- [User Roles](#user-roles)
- [API Overview](#api-overview)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

- **🔐 Role-Based Authentication** — Farmers, Extension Officers, and Admins each have isolated, secure portals
- **🌱 Crop Management** — Register crops, track growth stages (Seedling → Vegetative → Flowering → Ripening → Harvested), and log yields
- **🏡 Farm & Plot Management** — Create and manage multiple land plots with detailed soil and location data
- **📅 Activity Scheduling** — Log irrigation, fertilization, and pest report activities per crop with timestamped records
- **🌦️ Automated Weather Alerts** — Real-time agricultural alerts (drought, flood, pest risks) powered by weather data
- **📊 Reports & Analytics** — Visual charts for activity trends and crop distribution; export full farm records as CSV
- **👩‍🌾 Extension Officer Portal** — Officers can view all linked farmer data in read-only mode and post expert advisory notes per crop
- **🛡️ Admin Console** — System-wide statistics, user management, and secure officer provisioning

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router v7 |
| **Styling** | Vanilla CSS (custom design system) |
| **Charts** | Chart.js + react-chartjs-2 |
| **Icons** | Lucide React |
| **Backend** | Node.js, Express 5 |
| **ORM** | Prisma |
| **Database** | PostgreSQL |
| **Auth** | JWT (JSON Web Tokens) + bcrypt |

---

## 🏗️ Architecture Overview

```
smart-farm-ms/
├── src/                  # React Frontend (Vite)
│   ├── components/       # Reusable UI components
│   ├── context/          # Auth context (React Context API)
│   ├── pages/            # All page-level components
│   └── utils/            # API utility (Axios)
│
└── server/               # Node.js/Express Backend
    ├── controllers/      # Request handlers
    ├── middleware/        # JWT Auth middleware
    ├── routes/           # Express route definitions
    ├── utils/            # DB client, weather helpers
    └── prisma/           # Database schema and migrations
```

---

## ✅ Prerequisites

Make sure the following are installed on your machine before proceeding:

| Tool | Version | Download |
|---|---|---|
| **Node.js** | v18+ | https://nodejs.org |
| **npm** | v9+ | Included with Node.js |
| **PostgreSQL** | v14+ | https://www.postgresql.org/download |
| **Git** | Latest | https://git-scm.com |

---

## 🚀 Setup & Installation

Follow these steps **exactly** in order.

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/smart-farm-ms.git
cd smart-farm-ms
```

---

### Step 2 — Set Up the PostgreSQL Database

Open your terminal and connect to PostgreSQL:

```bash
psql -U postgres
```

Create a new database for the project:

```sql
CREATE DATABASE sfms_db;
\q
```

---

### Step 3 — Configure Backend Environment Variables

Navigate into the server directory and create a `.env` file:

```bash
cd server
cp .env.example .env
```

> If `.env.example` does not exist, create a new file named `.env` manually.

Open the `.env` file and fill in the following values:

```env
# Database Connection (replace with your PostgreSQL credentials)
DATABASE_URL="postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/sfms_db"

# JWT Secret — use any long, random string (minimum 32 characters)
JWT_SECRET="your-very-long-and-secure-random-secret-key-here"

# Server Port (optional, defaults to 5000)
PORT=5000
```

**Example with default PostgreSQL user:**
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/sfms_db"
JWT_SECRET="sfms-super-secret-jwt-key-2024-production-ready"
PORT=5000
```

---

### Step 4 — Install Backend Dependencies

While still inside the `server/` directory:

```bash
npm install
```

---

### Step 5 — Run Database Migrations

This command creates all the database tables based on the Prisma schema:

```bash
npx prisma migrate deploy
```

> **First-time setup?** If `migrate deploy` doesn't work, use:
> ```bash
> npx prisma migrate dev --name init
> ```

---

### Step 6 — Seed the Admin Account

This creates the default system administrator account:

```bash
npm run seed
# or manually:
npx prisma db seed
```

---

### Step 7 — Install Frontend Dependencies

Open a **new terminal**, navigate to the project root:

```bash
cd ..    # Go back to smart-farm-ms/
npm install
```

---

## ▶️ Running the Application

You will need **two terminal windows** running simultaneously.

### Terminal 1 — Start the Backend Server

```bash
cd server
npm run dev
```

You should see:
```
✅ Server running on port 5000
✅ Database connected
```

### Terminal 2 — Start the Frontend Dev Server

```bash
# From the project root (smart-farm-ms/)
npm run dev
```

You should see:
```
  VITE v8.x.x  ready in Xms

  ➜  Local:   http://localhost:5173/
```

Open your browser and navigate to **http://localhost:5173**

---

## 🔑 Default Credentials

After seeding, the following admin account is available:

| Role | Phone | Password |
|---|---|---|
| **System Admin** | `0780000000` | `AdminPassword123!` |

> ⚠️ **Important:** Change the admin password immediately after your first login in a production environment.

---

## 👥 User Roles

SFMS has three distinct user roles, each with a dedicated portal:

| Role | Access | How to Create |
|---|---|---|
| **Farmer** | Personal farm data, crops, alerts, reports | Self-register at `/register` |
| **Extension Officer** | Read-only view of linked farmers + advisory notes | **Admin-only** — via Admin Console → User Management → "Provision Officer" |
| **Admin** | Full system control, user management, statistics | Seeded via `npx prisma db seed` |

> **Security Note:** Only Farmers can self-register publicly. Extension Officer accounts must be created by an Administrator to ensure only verified agricultural workers gain access to sensitive farm data.

---

## 🌐 API Overview

The backend runs on `http://localhost:5000` and exposes the following endpoints:

| Category | Endpoint | Description |
|---|---|---|
| **Auth** | `POST /api/auth/register` | Register a new farmer account |
| **Auth** | `POST /api/auth/login` | Login and receive JWT token |
| **Farms** | `GET /api/farms` | Get all farms for current user |
| **Farms** | `POST /api/farms` | Create a new farm plot |
| **Crops** | `GET /api/crops` | Get all crops for current user |
| **Crops** | `POST /api/crops` | Register a new crop |
| **Crops** | `PATCH /api/crops/:id` | Update crop details (stage, yield, status) |
| **Activities** | `POST /api/activities` | Log an irrigation / fertilization activity |
| **Alerts** | `GET /api/alerts` | Get all system alerts for the user |
| **Reports** | `GET /api/reports/analytics` | Get analytics data for charts |
| **Reports** | `GET /api/reports/export` | Export farm data as CSV |
| **Advice** | `GET /api/advice/:cropId` | Get officer advice for a crop |
| **Advice** | `POST /api/advice` | Post advisory note (officers only) |
| **Admin** | `GET /api/admin/stats` | System-wide statistics (admin only) |
| **Admin** | `GET /api/admin/users` | All registered users (admin only) |
| **Admin** | `POST /api/admin/officers` | Provision new Extension Officer (admin only) |

All protected endpoints require the following HTTP header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 📁 Project Structure

```
smart-farm-ms/
│
├── src/                          # Frontend Source
│   ├── components/
│   │   ├── ActivityModal.jsx     # Crop activity form modal
│   │   ├── ActivityTimeline.jsx  # Crop activity history view
│   │   ├── DashboardLayout.jsx   # Main farmer dashboard wrapper
│   │   └── PrivateRoute.jsx      # Route authentication guard
│   │
│   ├── context/
│   │   └── AuthContext.jsx       # Global authentication state
│   │
│   ├── pages/
│   │   ├── Login.jsx             # Login page
│   │   ├── Register.jsx          # Farmer registration page
│   │   ├── FarmerHome.jsx        # Farmer dashboard home
│   │   ├── Farms.jsx             # Plot listing page
│   │   ├── FarmDetail.jsx        # Individual plot detail page
│   │   ├── Crops.jsx             # Crop management page
│   │   ├── Alerts.jsx            # System alerts page
│   │   ├── Reports.jsx           # Analytics & reports page
│   │   ├── ExtensionDashboard.jsx  # Extension officer portal
│   │   ├── ExtensionFarmerView.jsx # Officer's view of a farmer
│   │   └── AdminDashboard.jsx    # Admin control console
│   │
│   └── utils/
│       └── api.js                # Configured Axios API client
│
├── server/                       # Backend Source
│   ├── controllers/              # Business logic handlers
│   ├── middleware/               # Auth middleware
│   ├── routes/                   # Express routes
│   ├── utils/
│   │   ├── db.js                 # Prisma client singleton
│   │   ├── access.js             # Role access helper
│   │   └── weather.js            # Weather data & alert generator
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   ├── migrations/           # Migration history
│   │   └── seed.js               # Initial data seeder
│   ├── auto_link.js              # Script to link officers to farmers
│   └── index.js                  # Express app entry point
│
└── README.md
```

---

## 🔧 Troubleshooting

### ❌ `DATABASE_URL` connection error
- Verify PostgreSQL is running: `sudo service postgresql status`
- Double-check your username, password, and database name in `.env`
- Ensure the `sfms_db` database exists: `psql -U postgres -c "\l"`

### ❌ `prisma migrate` fails
- Confirm your `DATABASE_URL` is correct
- Try: `npx prisma db push` instead for a quick schema sync without migration history

### ❌ Port already in use
- Backend defaults to port `5000`. Change `PORT=5001` in `server/.env` if needed
- Frontend defaults to port `5173` (Vite). Run with `npm run dev -- --port 3000` to change

### ❌ JWT Token errors / redirected to login
- Ensure `JWT_SECRET` is the **same value** in your `.env` even after server restarts
- Clear `localStorage` in your browser developer tools and try logging in again

### ❌ Newly provisioned Extension Officers see an empty dashboard
- Run the auto-link script: `cd server && node auto_link.js`
- This links the officer to all registered farmers in the system

---



*Built for the Smart Farm Management System project — Empowering Rwandan farmers through digital agriculture.*
