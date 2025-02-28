import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CattleInfo from './pages/CattleInfo';
import RtPcr from './pages/RtPcr';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';
import Footer from './components/Footer';

// Wrapper component to handle route transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition>
            <Landing />
          </PageTransition>
        } />
        <Route path="/login" element={
          <PageTransition>
            <Login />
          </PageTransition>
        } />
        <Route path="/register" element={
          <PageTransition>
            <Register />
          </PageTransition>
        } />
        <Route path="/forgot-password" element={
          <PageTransition>
            <ForgotPassword />
          </PageTransition>
        } />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <Profile />
              </PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cattle-info" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <CattleInfo />
              </PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/rt-pcr" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <RtPcr />
              </PageTransition>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#020617] text-white flex flex-col">
          <Navbar />
          <div className="flex-grow">
            <AnimatedRoutes />
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;