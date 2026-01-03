import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Landing Page Components (Single Page Scroll)
// Iske andar About, Pricing, Contact sections hone chahiye
import Home from './pages/Home'
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Dashboard Components
import DashboardLayout from './components/fitnessTrackingDashboard/DashboardLayout';
import Dashboard from './pages/fitnessTrackingDashboard/Dashboard';
import WorkoutModule from './components/fitnessTrackingDashboard/Workout';
import NutritionModule from './components/fitnessTrackingDashboard/Nutrition';
import ProgressModule from './components/fitnessTrackingDashboard/Progress';

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
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <>
      {/* Navbar hamesha dikhega but iske links toggle honge */}
      {!isDashboard && <Navbar />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          
          {/* 1. LANDING PAGE (All-in-One Scroll) */}
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />

          {/* Note: Agar aapko About/Pricing ke alag PAGES chahiye toh niche wali lines rehne dein.
             Lekin agar Home par hi scroll karwana hai, toh in routes ki zaroorat nahi.
          */}

          {/* 2. ELITE DASHBOARD SECTION */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<PageWrapper><Dashboard /></PageWrapper>} />
            <Route path="workouts" element={<PageWrapper><WorkoutModule /></PageWrapper>} />
            <Route path="nutrition" element={<PageWrapper><NutritionModule /></PageWrapper>} />
            <Route path="progress" element={<PageWrapper><ProgressModule /></PageWrapper>} />
          </Route>

        </Routes>
      </AnimatePresence>

      {!isDashboard && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <div className="bg-[#050505] min-h-screen text-white overflow-x-hidden">
        <AnimatedRoutes />
      </div>
    </Router>
  );
};

export default App;