# College Event and Club Management System (CECMS) — Amrita Connect

A full-stack web application designed for **Amrita Vishwa Vidyapeetham** to streamline college club and event management. Students can explore clubs, register for technical workshops and cultural festival events, and receive notifications, while coordinators and administrators manage events, attendance, festival calendars, and system activities.

Developed as a third-year Software Engineering semester project.

---

## 🏛️ Project Highlights & Features

- **Student Registration & Two-Step Authentication:** Restricted to official Amrita student emails (`@cb.students.amrita.edu`) with OTP verification challenges and secure HttpOnly cookie sessions.
- **Browse & Join Exactly 8 Approved Campus Clubs:**
  1. *Literary and Book Club* (Literature)
  2. *Film and Cinema Society* (Media & Film)
  3. *Photography and Visual Arts* (Arts)
  4. *Coding and Open Source* (Technology)
  5. *Robotics and Innovation* (Technology)
  6. *Music and Performing Arts* (Performing Arts)
  7. *Debate and Public Speaking* (Communication)
  8. *Entrepreneurship* (Business)
- **Separated Event Directory & Homepage Layout:**
  - **Three Regular Events:** *Build Night: Tiny Web Apps*, *Stories After Hours*, *Pitch Your First Idea*.
  - **Two Dedicated Festival Events:** *Diwali Lights & Rangoli*, *Dussehra and Navaratri Cultural Evening*.
- **Dynamic Festival Theme Calendar:**
  - **Diwali Lights Theme:** Golden-amber accents, warm glow (`#B45309`, `#F5B301`), and diya motifs.
  - **Dussehra & Navaratri Theme:** Vibrant magenta, violet, and marigold accents (`#A3155E`, `#FF9800`).
  - **Everyday Campus Theme:** Elegant Amrita maroon (`#881337`).
  - **Admin Theme Previewer:** Administrators can test and preview themes before scheduling.
- **Event Lifecycle & Attendance Management:** Coordinators can create events, review and approve attendee registrations, record event attendance, and publish announcements.
- **Role-Based Portals:** Dedicated dashboards for Students, Club Coordinators, and System Administrators.
- **Persistent Notifications & Toast Feedback:** Global unread badge counter in navigation with notification drawer and live toast alerts.

---

## 🛠️ Technology Stack

- **Frontend:** React.js 18, Vite, React Router v6, Lucide React, Custom Responsive CSS Design System
- **Backend:** Node.js, Express.js, Helmet, CORS, Cookie-Parser, Express-Rate-Limit, Zod validation
- **Database:** MySQL / MariaDB (relational schema with foreign keys and transactions)
- **Authentication:** bcrypt password hashing, JWT HttpOnly sessions, OTP verification

---

## 📂 Project Structure

```text
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
│   ├── scripts/              # Database initialization & test account seeds
│   ├── tests/                # Automated API test suite
│   └── package.json
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
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) and npm
- MySQL Server or MariaDB
- Git

### 1. Database Setup
Create the MySQL database and import schema and seed data:
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
The Express backend starts at `http://localhost:4000`. Run automated tests anytime using `npm test`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend launches at `http://localhost:5173`. Requests to `/api` are automatically proxied to the backend.

---

## 🔑 Default Evaluation Accounts

The test seed script configures standard credentials for academic evaluation:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Student** | `student@cb.students.amrita.edu` | `StudentPass123!` | Student Dashboard, Register, Join Clubs |
| **Coordinator** | `coordinator@cb.amrita.edu` | `CoordPass123!` | Coordinator Console, Events, Attendance |
| **Administrator** | `admin@cb.amrita.edu` | `AdminPass123!` | Admin Console, Theme Calendar, User Roles |

---

## 👥 Collaborators


1. **Diya S. Kamath** — [@diyaskamath](https://github.com/diyaskamath)
2. **Sanmathi Katikala** — [@Sanmathi19](https://github.com/Sanmathi19)
3. **Suryaa Balamurugan** — [@suryaabalamurugan0-hub](https://github.com/suryaabalamurugan0-hub)

---

## 📄 Academic Project Attribution
This project was developed for the 3rd-Year Software Engineering Course at **Amrita Vishwa Vidyapeetham**.
All demonstration content is designed for academic presentation.
