# Amrita Connect — Frontend Portal (CECMS)

This is the responsive frontend web application for **Amrita Connect — College Event & Club Management System (CECMS)**, built as a 3rd-year Software Engineering semester project.

## Tech Stack
- **Framework:** React 18
- **Bundler & Dev Server:** Vite
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Styling:** Custom Modern CSS Design System with Dynamic Festival Theme injection
- **API Client:** Fetch API with automatic cookie handling (`credentials: 'include'`) and structured error boundaries

## Key Features & Architecture
1. **Dynamic Festival Theme Manager:**
   - Automatically queries active festival windows from `/api/themes/active`.
   - Injects dynamic CSS variables for **Diwali Lights** (golden-amber, diyas, radiant glow) and **Dussehra & Navaratri Cultural Evening** (magenta, violet, marigolds).
   - Returns seamlessly to the default Amrita maroon theme outside festival windows.
   - Admin live theme preview feature.
2. **Strict Initial Demo Content:**
   - **Exactly 8 Campus Clubs:** Literary and Book Club, Film and Cinema Society, Photography and Visual Arts, Coding and Open Source, Robotics and Innovation, Music and Performing Arts, Debate and Public Speaking, Entrepreneurship.
   - **Homepage Layout:** Dedicated separate sections for **3 Regular Events** and **2 Dedicated Festival Events**.
   - **Events Directory:** Full listing of all 5 initial campus events with category & kind filters.
3. **Authentication & Multi-Factor Security:**
   - Student domain validation (`@cb.students.amrita.edu`).
   - Two-step OTP verification challenge.
   - Persistent session state via HttpOnly cookies and AuthContext.
   - Quick Evaluation Logins helper on the sign-in page for demo/presentation.
4. **Role-Based Portals:**
   - **Student Dashboard:** Joined clubs, event registrations, bookmarked events, verified participation history, and club creation proposals.
   - **Coordinator Dashboard:** Club management, event creation, attendee registration review, and attendance marking.
   - **Admin Console:** Platform overview metrics, festival calendar & theme scheduling, coordinator club assignment, and user account role management.
5. **Real-Time Notification Center & Alerts:**
   - Persistent notification bell with live unread badge counter.
   - Notification history dropdown with "Mark all read" capability.
   - Global auto-dismissing toast notifications.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`, with requests to `/api` proxied directly to the Express backend running at `http://localhost:4000`.

### 3. Production Build
```bash
npm run build
```
Creates an optimized, production-ready bundle in the `dist/` directory.
