import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Landing Page Components
import Home from './pages/Home';
import Pricing from './pages/Pricing';
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

// Admin Dashboard
import AdminDashboard from './pages/adminDashboard/adminDashboard';

// Trial Modals
import TrialWelcomeModal from './components/TrialWelcomeModal';
import TrialExpiredModal from './components/TrialExpiredModal';

// Ban Alert
import BanAlert from './components/BanAlert';

// Context
import { AppProvider, useAppContext } from './context/useAppContext';

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
  const { user, fetchUser, banAlert, setBanAlert, checkUserBanStatus } = useAppContext();
  
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAdmin = location.pathname.startsWith('/admin');
  
  // Immediate ban check on login
  useEffect(() => {
    if (userId && isLoaded && !banAlert) {
      console.log('Checking ban status immediately on login');
      checkUserBanStatus();
    }
  }, [userId, isLoaded, banAlert, checkUserBanStatus]);

  // Fetch user data on login
  useEffect(() => {
    if (userId && isLoaded && !user) {
      fetchUser();
    }
  }, [userId, isLoaded, fetchUser]);

  // Check for banned user after login - multiple checks for reliability
  useEffect(() => {
    if (user && user.isBanned && !banAlert) {
      console.log('User is banned, showing ban alert:', user);
      setBanAlert({
        message: 'Your account has been suspended',
        reason: user.banReason || 'Your account has been suspended. Please contact support.'
      });
    }
  }, [user, banAlert, setBanAlert]);

  // Additional check when userId changes (login/logout)
  useEffect(() => {
    if (userId && isLoaded && user && user.isBanned && !banAlert) {
      console.log('Ban check on userId change:', user.isBanned);
      setBanAlert({
        message: 'Your account has been suspended',
        reason: user.banReason || 'Your account has been suspended. Please contact support.'
      });
    }
  }, [userId, isLoaded, user, banAlert, setBanAlert]);
  
  // Check trial status
  useEffect(() => {
    if (user && user.pricing === 'starter' && userId) {
      const now = new Date();
      const trialEnd = new Date(user.trialEnd);
      const welcomeKey = `trialWelcomeShown_${userId}`;
      
      if (trialEnd > now) {
        // Trial active, show welcome only once
        if (!localStorage.getItem(welcomeKey)) {
          setShowWelcomeModal(true);
          localStorage.setItem(welcomeKey, 'true');
        }
      } else {
        // Trial expired, show expired modal
        setShowExpiredModal(true);
      }
    }
  }, [user, userId]);
  
  // Show loading until authentication is determined
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  // If trying to access dashboard or admin without authentication, redirect to homepage
  if ((isDashboard || isAdmin) && !userId) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user is banned, don't allow access to dashboard/admin
  if ((isDashboard || isAdmin) && user && user.isBanned) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <>
      {/* Navbar tab dikhega jab dashboard na ho */}
      {!isDashboard && !isAdmin && <Navbar />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          
          {/* 1. LANDING PAGE */}
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/pricing" element={<PageWrapper><Pricing /></PageWrapper>} />

          {/* 2. ELITE DASHBOARD SECTION */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<PageWrapper><Dashboard /></PageWrapper>} />
            <Route path="workouts" element={<PageWrapper><WorkoutModule /></PageWrapper>} />
            <Route path="nutrition" element={<PageWrapper><NutritionModule /></PageWrapper>} />
            <Route path="progress" element={<PageWrapper><ProgressModule /></PageWrapper>} />
          </Route>

          {/* 3. ADMIN DASHBOARD */}
          <Route path="/admin" element={<PageWrapper><AdminDashboard /></PageWrapper>} />

        </Routes>
      </AnimatePresence>

      {/* Footer tab dikhega jab dashboard na ho */}
      {!isDashboard && !isAdmin && <Footer />}

      {/* Trial Modals */}
      {showWelcomeModal && (
        <TrialWelcomeModal 
          user={user} 
          onClose={() => setShowWelcomeModal(false)} 
        />
      )}
      {showExpiredModal && (
        <TrialExpiredModal 
          user={user} 
          onClose={() => setShowExpiredModal(false)} 
        />
      )}

      {/* Ban Alert */}
      {banAlert && (
        <BanAlert 
          banAlert={banAlert} 
          onClose={() => setBanAlert(null)} 
        />
      )}
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