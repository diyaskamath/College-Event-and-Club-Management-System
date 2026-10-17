import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import ClubsPage from './pages/ClubsPage';
import ClubDetailPage from './pages/ClubDetailPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import CampusLifePage from './pages/CampusLifePage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpVerificationPage from './pages/OtpVerificationPage';
import StudentDashboard from './pages/StudentDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/clubs" element={<ClubsPage />} />
                  <Route path="/clubs/:idOrSlug" element={<ClubDetailPage />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/events/:idOrSlug" element={<EventDetailPage />} />
                  <Route path="/campus-life" element={<CampusLifePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/verify-otp" element={<OtpVerificationPage />} />

                  {/* Protected Student Dashboard */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'coordinator', 'admin']}>
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Coordinator Dashboard */}
                  <Route
                    path="/coordinator"
                    element={
                      <ProtectedRoute allowedRoles={['coordinator', 'admin']}>
                        <CoordinatorDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Admin Console */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Fallback */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
              <Toast />
            </div>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}