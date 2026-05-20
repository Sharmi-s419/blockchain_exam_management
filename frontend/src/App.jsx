import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import ExamArena from './pages/ExamArena';
import ExamResult from './pages/ExamResult';
import { jwtDecode } from 'jwt-decode';

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('access');
  if (!token || token === 'undefined' || token === 'null') {
    localStorage.removeItem('access');
    return <Navigate to="/login" />;
  }
  
  try {
    const decoded = jwtDecode(token);
    if (role && decoded.role !== role) {
      return <Navigate to="/" />;
    }
    return children;
  } catch (error) {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    return <Navigate to="/login" />;
  }
}

function Main() {
  const token = localStorage.getItem('access');
  // Check for missing or corrupted tokens
  if (!token || token === 'undefined' || token === 'null') {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    return <Navigate to="/login" replace />;
  }
  
  try {
    const decoded = jwtDecode(token);
    // Redirect based on role if token is valid
    if (decoded && decoded.role) {
      return decoded.role === 'Admin' 
        ? <Navigate to="/admin" replace /> 
        : <Navigate to="/dashboard" replace />;
    }
    throw new Error("Invalid token role");
  } catch (error) {
    // If decoding fails, clear and send to login
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={
            <ProtectedRoute role="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute role="Student">
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/exam/:id" element={
            <ProtectedRoute role="Student">
              <ExamArena />
            </ProtectedRoute>
          } />
          <Route path="/exam/:id/result" element={
            <ProtectedRoute role="Student">
              <ExamResult />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
