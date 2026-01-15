import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Landing Page Components
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Auth Component (New)
 // Make sure path is correct

// Dashboard Components
import DashboardLayout from './components/fitnessTrackingDashboard/DashboardLayout';
import Dashboard from './pages/fitnessTrackingDashboard/Dashboard';
import WorkoutModule from './components/fitnessTrackingDashboard/Workout';
import NutritionModule from './components/fitnessTrackingDashboard/Nutrition';
import ProgressModule from './components/fitnessTrackingDashboard/Progress';

// Context
import { AppProvider } from './context/useAppContext';

// Clerk Auth
import { useAuth } from '@clerk/clerk-react';

// 3D Page Transition Wrapper
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, rotateY: 5 }}
    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
    exit={{ opacity: 0, scale: 1.05, rotateY: -5 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  const { userId, isLoaded } = useAuth();
  
  const isDashboard = location.pathname.startsWith('/dashboard');
  
  // Show loading until authentication is determined
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  // If trying to access dashboard without authentication, redirect to homepage
  if (isDashboard && !userId) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <>
      {/* Navbar tab dikhega jab dashboard na ho */}
      {!isDashboard && <Navbar />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          
          {/* 1. LANDING PAGE */}
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />

          {/* 2. ELITE DASHBOARD SECTION */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<PageWrapper><Dashboard /></PageWrapper>} />
            <Route path="workouts" element={<PageWrapper><WorkoutModule /></PageWrapper>} />
            <Route path="nutrition" element={<PageWrapper><NutritionModule /></PageWrapper>} />
            <Route path="progress" element={<PageWrapper><ProgressModule /></PageWrapper>} />
          </Route>

        </Routes>
      </AnimatePresence>

      {/* Footer tab dikhega jab dashboard na ho */}
      {!isDashboard && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <div className="bg-[#050505] min-h-screen text-white overflow-x-hidden">
          <AnimatedRoutes />
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;