# Amrita Connect — College Event & Club Management System (CECMS)

**Amrita Connect** is a full-stack university event and student club management platform built for **Amrita Vishwa Vidyapeetham**. Developed as a third-year Software Engineering semester project, the application brings together campus organizations, technical workshops, cultural celebrations, multi-factor authentication, and administrator controls into a unified web portal.

---

## 🏛️ Project Highlights & Features

### 1. Dedicated Festival Themes & Dynamic Seasonal Calendar
- **Diwali Lights Theme:** Golden-amber accents, warm glow (`#B45309`, `#F5B301`), and diya motifs.
- **Dussehra & Navaratri Theme:** Vibrant magenta, violet, and marigold styling (`#A3155E`, `#FF9800`).
- **Standard Everyday Theme:** Refined Amrita university maroon (`#881337`).
- **Automated Calendar Scheduler:** The portal automatically applies festival visual themes when current campus dates fall within scheduled windows and returns to standard styling outside festival periods.
- **Admin Theme Previewer:** Administrators can preview and test any festival theme before applying changes to the live schedule.

### 2. Strict Initial Demonstration Content
- **Exactly Eight Approved Campus Clubs:**
  1. *Literary and Book Club* (Literature)
  2. *Film and Cinema Society* (Media & Film)
  3. *Photography and Visual Arts* (Arts)
  4. *Coding and Open Source* (Technology)
  5. *Robotics and Innovation* (Technology)
  6. *Music and Performing Arts* (Performing Arts)
  7. *Debate and Public Speaking* (Communication)
  8. *Entrepreneurship* (Business)
- **Separated Event Sections on Homepage:**
  - **Three Regular Events:** *Build Night: Tiny Web Apps*, *Stories After Hours*, *Pitch Your First Idea*.
  - **Two Dedicated Festival Events:** *Diwali Lights & Rangoli*, *Dussehra and Navaratri Cultural Evening*.
- **Demonstration Notice:** All sample dates, academic blocks, and venues are explicitly labelled as demo data placeholders for academic evaluation.

### 3. Authentication & Security
- **Domain Validation:** Student registration is restricted to official `@cb.students.amrita.edu` addresses.
- **Two-Factor OTP Security:** Verification code challenges for student registration and staff logins.
- **Session Protection:** HttpOnly, SameSite cookies with JWT validation against a persistent database sessions table.
- **Rate Limiting:** Protection against brute-force credential and OTP guessing attacks.

### 4. Role-Based Dashboards
- **Student Portal (`/dashboard`):** Track registered events, joined clubs, bookmarked events, verified participation records, and submitted club proposals.
- **Coordinator Console (`/coordinator`):** Create and schedule events, approve student registrations, track attendance, and publish club announcements.
- **Admin Console (`/admin`):** System metrics, festival calendar scheduler with live theme preview, club proposal approval queue, and user role management.

### 5. Persistent Notifications & Alerts
- Global notification bell in the navigation bar with an unread badge counter.
- Slide-in toast alerts for actions, confirmations, and validation feedback.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Lucide React, Custom CSS Design System |
| **Backend** | Node.js, Express.js, Helmet, CORS, Cookie-Parser, express-rate-limit, Zod |
| **Database** | MySQL / MariaDB (relational schema with foreign keys and transactions) |
| **Security** | bcrypt password hashing, JWT HttpOnly sessions, OTP verification |

---

## 📂 Repository Directory Layout

```
CECMS/
├── backend/                  # Express REST API & Database Scripts
│   ├── db/
│   │   ├── schema.sql        # Database schema (tables, foreign keys, indices)
│   │   └── seed.sql          # Idempotent seed script (8 clubs, 5 events, 2 themes)
│   ├── src/
│   │   ├── config/           # Environment configuration & defaults
│   │   ├── controllers/      # API endpoint controllers
│   │   ├── middleware/       # Auth, role check, rate limiting, error handlers
│   │   ├── routes/           # REST route definitions
│   │   ├── services/         # Business logic (auth, clubs, events, themes, notifications)
│   │   └── server.js         # HTTP server entry point
│   └── tests/                # Automated API test suite
│
├── frontend/                 # React & Vite Single-Page Application
│   ├── src/
│   │   ├── api/              # API client wrapper
│   │   ├── components/       # Navbar, Footer, EventCard, ClubCard, Modal, Toast, Badge
│   │   ├── context/          # AuthContext, ThemeContext, NotificationContext
│   │   ├── pages/            # Home, Clubs, Events, Login, Register, OTP, Dashboards
│   │   ├── styles/           # Global and component styles
│   │   ├── App.jsx           # Routing and role-protected routes
│   │   └── main.jsx          # React DOM entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js        # Vite dev server with /api proxy
│
└── README.md                 # Complete project documentation
```

---

## 🚀 Quick Start Guide

### 1. Database Setup
Create a MySQL or MariaDB database named `cecms_dev`:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS cecms_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p cecms_dev < backend/db/schema.sql
mysql -u root -p cecms_dev < backend/db/seed.sql
```

### 2. Backend Setup
```bash
cd backend
npm install
node scripts/seed-accounts.js
npm run dev
```
The backend API starts on `http://localhost:4000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend launches at `http://localhost:5173`.

---

## 🔑 Default Evaluation Accounts

The test seed script configures standard credentials for academic evaluation:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Student** | `student@cb.students.amrita.edu` | `StudentPass123!` | Student Dashboard, Register, Join Clubs |
| **Coordinator** | `coordinator@cb.amrita.edu` | `CoordPass123!` | Coordinator Console, Events, Attendance |
| **Administrator** | `admin@cb.amrita.edu` | `AdminPass123!` | Admin Console, Theme Calendar, User Roles |

---

## 📄 Academic Project Attribution
This project was developed for the 3rd-Year Software Engineering Course at **Amrita Vishwa Vidyapeetham**.
All demonstration content is designed for academic presentation.
