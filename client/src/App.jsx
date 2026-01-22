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
import CustomPopUp from './components/adminDashboard/CustomPopUp';

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
  const { user, fetchUser, banAlert, setBanAlert, checkUserRole, showExpiredModal, setShowExpiredModal, setExpiredModalDismissed } = useAppContext();
  
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAdmin = location.pathname.startsWith('/admin');
  
  // Immediate role check on login
  useEffect(() => {
    if (userId && isLoaded && !user) {
      checkUserRole().then(userData => {
        if (userData) {
          // User data will be set by fetchUser
          fetchUser();
        }
      });
    }
  }, [userId, isLoaded, user, checkUserRole, fetchUser]);

  // Fetch user data on login
  useEffect(() => {
    if (userId && isLoaded && !user) {
      fetchUser();
    }
  }, [userId, isLoaded, fetchUser]);

  // Check for banned user after login - multiple checks for reliability
  useEffect(() => {
    if (user && user.isBanned && !banAlert) {
      setBanAlert({
        message: 'Your account has been suspended',
        reason: user.banReason || 'Your account has been suspended. Please contact support.'
      });
    }
  }, [user, banAlert, setBanAlert]);

  // Additional check when userId changes (login/logout)
  useEffect(() => {
    if (userId && isLoaded && user && user.isBanned && !banAlert) {
      setBanAlert({
        message: 'Your account has been suspended',
        reason: user.banReason || 'Your account has been suspended. Please contact support.'
      });
    }
  }, [userId, isLoaded, user, banAlert, setBanAlert]);
  
  // Check trial status - exclude admin users
  useEffect(() => {
    if (user && user.pricing === 'starter' && userId) {
      // Reset expired modal dismissed when navigating to dashboard
      if (location.pathname.startsWith('/dashboard')) {
        setExpiredModalDismissed(false);
      }
      // Don't show trial modals for admin users
      if (user.role === 'admin' || user.role === 'owner') {
        return;
      }
      
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
  
  // Show loading until authentication and user data is loaded, but show ban alert if detected
  if (!isLoaded || (userId && !user && !banAlert)) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
        {banAlert && (
          <BanAlert 
            banAlert={banAlert} 
            onClose={() => setBanAlert(null)} 
          />
        )}
      </div>
    );
  }
  
  // If user is banned, show only ban alert
  if (banAlert) {
    return (
      <div className="min-h-screen bg-[#050505]">
        <BanAlert 
          banAlert={banAlert} 
          onClose={() => setBanAlert(null)} 
        />
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

  // Role-based redirects - Admin users ko admin dashboard, Regular users ko tracker dashboard
  if (userId && user) {
    const isAdminUser = user.role === 'admin' || user.role === 'owner';
    const isRegularUser = user.role === 'user';
    
    // Admin trying to access user dashboard -> redirect to admin
    if (isAdminUser && isDashboard) {
      return <Navigate to="/admin" state={{ from: location }} replace />;
    }
    
    // Regular user trying to access admin dashboard -> redirect to user dashboard
    if (isRegularUser && isAdmin) {
      return <Navigate to="/dashboard" state={{ from: location }} replace />;
    }
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

          {/* 2. TRACKER DASHBOARD SECTION */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<PageWrapper><Dashboard /></PageWrapper>} />
            <Route path="workouts" element={<PageWrapper><WorkoutModule /></PageWrapper>} />
            <Route path="nutrition" element={<PageWrapper><NutritionModule /></PageWrapper>} />
            <Route path="progress" element={<PageWrapper><ProgressModule /></PageWrapper>} />
          </Route>

       
          
         
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