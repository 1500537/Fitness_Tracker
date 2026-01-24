import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { io } from 'socket.io-client';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { userId, isLoaded } = useAuth();
  const { signOut } = useClerk();
  
  // Check if socket is enabled
  const isSocketEnabled = import.meta.env.VITE_ENABLE_SOCKET === 'true';
  
  const [workouts, setWorkouts] = useState([]);
  const [nutrition, setNutrition] = useState([]);
  const [progress, setProgress] = useState([]);
  const [goals, setGoals] = useState({ type: 'bench', value: 100 });
  const [dashboard, setDashboard] = useState(null);
  const [user, setUser] = useState(null);
  const [nutritionStats, setNutritionStats] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    mealCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Admin user management
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Real-time ban alert
  const [banAlert, setBanAlert] = useState(null);

  // API base URL
  const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

  // Admin drill management
  const [drills, setDrills] = useState([]);
  const [drillsLoading, setDrillsLoading] = useState(false);

  // Admin category management
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Revenue management
  const [revenueData, setRevenueData] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(false);

  // Plans management
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);

  // User subscription management
  const [userSubscription, setUserSubscription] = useState(null);
  const [subscriptionTimer, setSubscriptionTimer] = useState(0);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [expiredModalDismissed, setExpiredModalDismissed] = useState(false);
  // Premium modal state (show on login when user has upgraded)
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumModalShownUserId, setPremiumModalShownUserId] = useState(null);
  // Socket for real-time updates
  const [socket, setSocket] = useState(null);

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setDashboard(data.dashboard);
        // Update related state from dashboard data
        setNutritionStats({
          totalCalories: data.dashboard.stats.totalCalories,
          totalProtein: data.dashboard.stats.totalProtein,
          totalCarbs: data.dashboard.stats.totalCarbs,
          totalFats: data.dashboard.stats.totalFats,
          mealCount: data.dashboard.recentNutrition.length
        });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Socket for real-time updates with error handling
  useEffect(() => {
    // Socket.IO disabled via environment variable
    if (!isSocketEnabled) {
      return;
    }

    if (isLoaded && userId) {
      let newSocket = null;
      
      try {
        newSocket = io(import.meta.env.VITE_BACKEND_URL, {
          transports: ['websocket', 'polling'],
          timeout: 5000,
          reconnection: false,
          forceNew: false
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
          newSocket.emit('join-user-room', userId);
        });

        // Progress real-time events
        newSocket.on('progress-added', (progress) => {
          setProgress(prev => {
            const filtered = prev.filter(p => p._id !== progress._id);
            return [progress, ...filtered];
          });
        });

        newSocket.on('progress-updated', (progress) => {
          setProgress(prev => prev.map(p => p._id === progress._id ? progress : p));
        });

        newSocket.on('progress-deleted', ({ id }) => {
          setProgress(prev => prev.filter(p => p._id !== id));
        });

        newSocket.on('connect_error', (error) => {
          newSocket.disconnect();
        });

        newSocket.on('disconnect', (reason) => {
          // Socket disconnected
        });

        return () => {
          if (newSocket) {
            newSocket.disconnect();
          }
        };
      } catch (error) {
        if (newSocket) {
          newSocket.disconnect();
        }
      }
    }
  }, [isLoaded, userId, isSocketEnabled]);

  // Fetch workouts for the current user (with caching)
  const fetchWorkouts = useCallback(async () => {
    if (!userId || loading) return;

    setLoading(true);
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/workouts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setWorkouts(data.workouts);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, loading, API_BASE]);

  // Create a new workout
  const createWorkout = async (workoutData) => {
    if (!userId) return { success: false, message: 'User not authenticated' };

    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/workouts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workoutData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setWorkouts(prev => {
          // Remove any existing workout with the same _id to prevent duplicates
          const filtered = prev.filter(w => w._id !== data.workout._id);
          return [data.workout, ...filtered];
        });
        return { success: true, workout: data.workout, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Update a workout
  const updateWorkout = async (id, workoutData) => {
    if (!userId) return { success: false, message: 'User not authenticated' };

    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/workouts/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workoutData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setWorkouts(prev => prev.map(w => w._id === id ? data.workout : w));
        return { success: true, workout: data.workout, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Delete a workout
  const deleteWorkout = async (id) => {
    if (!userId) return { success: false, message: 'User not authenticated' };

    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/workouts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Handle 404 errors gracefully - workout might already be deleted
      if (response.status === 404) {
        setWorkouts(prev => prev.filter(w => w._id !== id));
        return { success: true, message: 'Workout deleted successfully' };
      }

      const data = await response.json();
      
      if (response.ok && data.success) {
        setWorkouts(prev => prev.filter(w => w._id !== id));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Delete failed' };
      }
    } catch (err) {
      // If network error, still remove from UI for better UX
      setWorkouts(prev => prev.filter(w => w._id !== id));
      return { success: true, message: 'Workout deleted successfully' };
    }
  };

  // Complete a workout
  const completeWorkout = async (id, duration) => {
    if (!userId) return { success: false, message: 'User not authenticated' };

    try {
      const response = await fetch(`${API_BASE}/workouts/${id}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ duration })
      });

      const data = await response.json();
      
      if (data.success) {
        setWorkouts(prev => prev.map(w => w._id === id ? data.workout : w));
        return { success: true, workout: data.workout, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Fetch nutrition entries for the current user (with caching)
  const fetchNutrition = useCallback(async (date = null) => {
    if (!userId || loading) return;

    setLoading(true);
    try {
      const url = date
        ? `${API_BASE}/nutrition?date=${date}`
        : `${API_BASE}/nutrition`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setNutrition(data.data);
        return data.data;
      } else {
        setError(data.message);
        return [];
      }
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId, loading, API_BASE]);

  // Fetch nutrition statistics (with caching)
  const fetchNutritionStats = useCallback(async (date = null) => {
    if (!userId) return;

    try {
      const url = date
        ? `${API_BASE}/nutrition/stats?date=${date}`
        : `${API_BASE}/nutrition/stats`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setNutritionStats(data.data);
        return data.data;
      } else {
        setError(data.message);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [userId, API_BASE]);

  // Fetch progress entries
  const fetchProgress = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/progress`, {
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        const allProgress = data.progress.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setProgress(allProgress);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch goals
  const fetchGoals = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${API_BASE}/progress/goals`, {
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setGoals(data.goals);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch user data
  const fetchUser = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${API_BASE}/users/me`, {
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        
        if (data.user.isBanned) {
          setTimeout(() => {
            setBanAlert({
              message: 'Your account has been suspended',
              reason: data.user.banReason || 'Your account has been suspended. Please contact support.'
            });
          }, 0);
        }
      } else {
        if (data.message === "Account banned") {
          setTimeout(() => {
            setBanAlert({
              message: 'Your account has been suspended',
              reason: 'Your account has been suspended. Please contact support.'
            });
          }, 0);
        }
      }
    } catch (err) {
      // Set fallback user state to prevent infinite loading
      if (!user) {
        setUser({ role: 'user', pricing: 'starter', _id: userId });
      }
    }
  }, [userId]);

  // Real-time user data refresh on payment success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true' && userId) {
      // Refresh user data after successful payment
      setTimeout(() => {
        fetchUser();
      }, 1000); // Small delay to ensure webhook processed
    }
  }, [userId, fetchUser]);

  // Add new nutrition entry
  const addNutritionEntry = async (nutritionData) => {
    if (!userId) return null;

    try {
      const response = await fetch(`${API_BASE}/nutrition`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nutritionData)
      });

      const data = await response.json();
      if (data.success) {
        setNutrition(prev => [data.data, ...prev]);
        // Refresh stats
        fetchNutritionStats();
        return data.data;
      } else {
        setError(data.message);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Update nutrition entry
  const updateNutritionEntry = async (id, nutritionData) => {
    if (!userId) return null;

    try {
      const response = await fetch(`${API_BASE}/nutrition/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nutritionData)
      });

      const data = await response.json();
      if (data.success) {
        setNutrition(prev => prev.map(n => n._id === id ? data.data : n));
        // Refresh stats
        fetchNutritionStats();
        return data.data;
      } else {
        setError(data.message);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Delete nutrition entry
  const deleteNutritionEntry = async (id) => {
    if (!userId) return false;

    try {
      const response = await fetch(`${API_BASE}/nutrition/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setNutrition(prev => prev.filter(n => n._id !== id));
        // Refresh stats
        fetchNutritionStats();
        return true;
      } else {
        setError(data.message);
        return false;
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Load workouts and nutrition when user is authenticated (with debouncing)
  useEffect(() => {
    let timeoutId;
    let isMounted = true;
    
    if (isLoaded && userId && !loading) {
      // Debounce the API calls to prevent rapid successive calls
      timeoutId = setTimeout(() => {
        if (isMounted) {
          const loadData = async () => {
            try {
              // Load data sequentially to prevent conflicts
              await fetchWorkouts();
              await fetchNutrition();
              await fetchNutritionStats();
            } catch (error) {
              // Error loading initial data
            }
          };
          
          loadData();
        }
      }, 200); // Increased delay for better stability
    }
    
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [userId, isLoaded]);

  // Separate effect for user data to prevent conflicts
  useEffect(() => {
    if (isLoaded && userId) {
      // Fetch user immediately when userId is available
      fetchUser();
    }
  }, [userId, isLoaded, fetchUser]);

  // Add new progress entry
  const addProgressEntry = async (progressData) => {
    if (!userId) return null;

    try {
      const response = await fetch(`${API_BASE}/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(progressData)
      });

      const data = await response.json();
      
      if (data.success) {
        // If socket is disabled, update state immediately
        if (!isSocketEnabled) {
          setProgress(prev => {
            // Remove any duplicate and add new entry at the beginning
            const filtered = prev.filter(p => p._id !== data.progress._id);
            const newProgress = [data.progress, ...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return newProgress;
          });
        }
        return data.progress;
      } else {
        setError(data.message);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Update goals
  const updateGoals = async (goalsData) => {
    if (!userId) return null;

    try {
      const response = await fetch(`${API_BASE}/progress/goals`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(goalsData)
      });

      const data = await response.json();
      if (data.success) {
        setGoals(data.goals);
        return data.goals;
      } else {
        setError(data.message);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Update progress entry
  const updateProgressEntry = async (id, progressData) => {
    if (!userId) return null;

    try {
      const response = await fetch(`${API_BASE}/progress/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(progressData)
      });

      const data = await response.json();
      
      if (data.success) {
        // If socket is disabled, update state immediately
        if (!isSocketEnabled) {
          setProgress(prev => {
            const updated = prev.map(p => p._id === id ? data.progress : p)
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return updated;
          });
        }
        return data.progress;
      } else {
        setError(data.message);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Delete progress entry
  const deleteProgressEntry = async (id) => {
    if (!userId) return null;

    try {
      const response = await fetch(`${API_BASE}/progress/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // If socket is disabled, update state immediately
        if (!isSocketEnabled) {
          setProgress(prev => {
            const filtered = prev.filter(p => p._id !== id);
            return filtered;
          });
        }
        return true;
      } else {
        setError(data.message);
        return false;
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Admin User Management Functions
  const fetchAllUsers = useCallback(async () => {
    setUsersLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/users/all`, {
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setAllUsers(data.users);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUsersLoading(false);
    }
  }, [API_BASE]);

  const updateUser = useCallback(async (userId, userData) => {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      if (data.success) {
        setAllUsers(prev => prev.map(user => user._id === userId ? { ...user, ...userData } : user));
        return true;
      } else {
        setError(data.message);
        return false;
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [API_BASE]);

  const deleteUser = useCallback(async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setAllUsers(prev => prev.filter(user => user._id !== userId));
        return true;
      } else {
        setError(data.message);
        return false;
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [API_BASE]);

  const toggleUserBan = useCallback(async (userId, banStatus, banReason = '') => {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/ban`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ banReason })
      });

      const data = await response.json();
      if (data.success) {
        // Update the user in allUsers array
        setAllUsers(prev => prev.map(user =>
          user._id === userId
            ? { ...user, isBanned: data.user.isBanned, banReason: data.user.banReason }
            : user
        ));
        // Emit real-time ban update
        if (socket) {
          socket.emit('ban-user', { userId, banned: banStatus });
        }
        return { success: true, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  }, [API_BASE]);

  // Drill Management Functions
  const fetchDrills = useCallback(async () => {
    setDrillsLoading(true);
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/workout-overview/drills`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setDrills(data.drills);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDrillsLoading(false);
    }
  }, []);

  const createDrill = async (drillData) => {
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/workout-overview/drills`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(drillData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        return { success: true, drill: data.drill, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const updateDrill = async (id, drillData) => {
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/workout-overview/drills/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(drillData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        return { success: true, drill: data.drill, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const deleteDrill = async (id) => {
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/workout-overview/drills/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Category Management Functions
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/workout-overview/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
        return { success: true, categories: data.categories };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const createCategory = async (categoryData) => {
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/workout-overview/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        return { success: true, category: data.category, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/workout-overview/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        return { success: true, category: data.category, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const deleteCategory = async (id) => {
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/workout-overview/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        // Update categories state immediately
        setCategories(prev => prev.filter(cat => cat._id !== id));
        return { success: true, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Upload media to Cloudinary
  const uploadDrillMedia = async (file) => {
    try {
      const token = await window.Clerk.session.getToken();
      const formData = new FormData();
      formData.append('media', file);

      const response = await fetch(`${API_BASE}/workout-overview/drills/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          videoUrl: data.videoUrl,
          mediaType: data.mediaType,
          mediaPublicId: data.mediaPublicId,
          thumbnailUrl: data.thumbnailUrl || null,
          message: data.message
        };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      let errorMessage = 'Upload failed. Please try again.';
      if (err.message.includes('413')) {
        errorMessage = 'File too large. Please use a smaller file.';
      } else if (err.message.includes('415')) {
        errorMessage = 'Unsupported file type. Please use a valid image or video file.';
      } else if (err.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Upload timed out. Please try with a smaller file.';
      }
      
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Revenue Management Functions
  const fetchRevenueData = useCallback(async () => {
    setRevenueLoading(true);
    try {
      const response = await fetch(`${API_BASE}/revenue/dashboard`);
      const data = await response.json();
      
      if (data.success) {
        setRevenueData(data.data);
        return { success: true, data: data.data };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setRevenueLoading(false);
    }
  }, []);

  const createSubscription = async (subscriptionData) => {
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/revenue/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionData)
      });

      const data = await response.json();
      if (data.success) {
        fetchRevenueData(); // Refresh data
        return { success: true, subscription: data.subscription, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const updateSubscription = async (subscriptionId, subscriptionData) => {
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/revenue/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionData)
      });

      const data = await response.json();
      if (data.success) {
        fetchRevenueData(); // Refresh data
        return { success: true, subscription: data.subscription, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const deleteSubscription = async (subscriptionId) => {
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/revenue/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchRevenueData(); // Refresh data
        return { success: true, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const extendSubscription = async (subscriptionId, days = 30) => {
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/revenue/subscriptions/${subscriptionId}/extend`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ days })
      });

      const data = await response.json();
      if (data.success) {
        fetchRevenueData(); // Refresh data
        return { success: true, subscription: data.subscription, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const cancelSubscription = async (subscriptionId) => {
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/revenue/subscriptions/${subscriptionId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchRevenueData(); // Refresh data
        return { success: true, subscription: data.subscription, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Plans Management Functions
  const fetchPlans = useCallback(async () => {
    setPlansLoading(true);
    try {
      const response = await fetch(`${API_BASE}/plans`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.plans) {
        setPlans(data.plans);
        return { success: true, plans: data.plans };
      } else {
        setError(data.message || 'Failed to fetch plans');
        setPlans([]);
        return { success: false, message: data.message || 'Failed to fetch plans' };
      }
    } catch (err) {
      setError(err.message);
      setPlans([]);
      return { success: false, message: err.message };
    } finally {
      setPlansLoading(false);
    }
  }, []);

  const createPlan = async (planData) => {
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/plans`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      });

      const data = await response.json();
      if (data.success) {
        return { success: true, plan: data.plan, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const updatePlan = async (id, planData) => {
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/plans/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      });

      const data = await response.json();
      if (data.success) {
        return { success: true, plan: data.plan, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const deletePlan = async (id) => {
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/plans/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };
  const fetchUserSubscription = useCallback(async () => {
    if (!userId) return;
    
    setSubscriptionLoading(true);
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/users/subscription`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setUserSubscription(data.subscription);
        if (data.subscription?.expiresAt) {
          const timeLeft = Math.max(0, Math.floor((new Date(data.subscription.expiresAt) - new Date()) / 1000));
          setSubscriptionTimer(timeLeft);
        }
      }
    } catch (err) {
      // Error fetching subscription
    } finally {
      setSubscriptionLoading(false);
    }
  }, [userId, API_BASE]);

  // Real-time timer countdown
  useEffect(() => {
    if (subscriptionTimer > 0) {
      const interval = setInterval(() => {
        setSubscriptionTimer(prev => {
          if (prev <= 1) {
            setUserSubscription(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [subscriptionTimer]);

  // Fetch subscription when user loads
  useEffect(() => {
    if (isLoaded && userId) {
      fetchUserSubscription();
    }
  }, [isLoaded, userId, fetchUserSubscription]);

  // Check user role and access
  const checkUserRole = useCallback(async () => {
    if (!userId) return null;

    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        return data.user;
      } else {
        setError(data.message);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [API_BASE, userId]);

  // Check route access
  const checkRouteAccess = useCallback(async (route) => {
    if (!userId) return false;

    try {
      const response = await fetch(`${API_BASE}/auth/access/${route}`, {
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data.success ? data.hasAccess : false;
    } catch (err) {
      return false;
    }
  }, [API_BASE, userId]);

  const clearError = () => setError(null);

  const value = {
    workouts,
    nutrition,
    nutritionStats,
    loading,
    error,
    dashboard,
    user,
    fetchWorkouts,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    completeWorkout,
    fetchNutrition,
    fetchNutritionStats,
    addNutritionEntry,
    updateNutritionEntry,
    deleteNutritionEntry,
    progress,
    goals,
    fetchProgress,
    fetchGoals,
    fetchDashboard,
    fetchUser,
    // Premium modal
    showPremiumModal,
    setShowPremiumModal,
    addProgressEntry,
    updateProgressEntry,
    deleteProgressEntry,
    updateGoals,
    setError,
    clearError,
    // Admin user management
    allUsers,
    usersLoading,
    fetchAllUsers,
    updateUser,
    deleteUser,
    toggleUserBan,
    // Real-time ban alert
    banAlert,
    setBanAlert,
    // Ban status check
    checkUserRole,
    checkRouteAccess,
    // Drill management
    drills,
    drillsLoading,
    fetchDrills,
    createDrill,
    updateDrill,
    deleteDrill,
    // Category management
    categories,
    categoriesLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    // Media upload
    uploadDrillMedia,
    // Revenue management
    revenueData,
    revenueLoading,
    fetchRevenueData,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    extendSubscription,
    cancelSubscription,
    // Plans management
    plans,
    plansLoading,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    // User subscription management
    userSubscription,
    subscriptionTimer,
    subscriptionLoading,
    fetchUserSubscription,
    showExpiredModal,
    setShowExpiredModal,
    setExpiredModalDismissed,
    // Check if user has active subscription
    isSubscriptionActive: () => {
      if (!user) return false;
      if (user.pricing === 'starter') return true; // Starter is always active
      return user.subscription?.isActive && 
             (!user.subscription?.expiresAt || new Date(user.subscription.expiresAt) > new Date());
    },
    // PDF generation
    generatePDFReport: async (filterPlan, filterBilling, chartFilter) => {
      try {
        const jsPDF = (await import('jspdf')).default;
        const autoTable = (await import('jspdf-autotable')).default;
        
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.setTextColor(255, 114, 34);
        doc.text('FITNESS TRACKER - REVENUE REPORT', 20, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
        doc.text(`Filters: Plan=${filterPlan}, Billing=${filterBilling}`, 20, 35);

        // Metrics
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text('REVENUE METRICS', 20, 50);
        
        const metrics = [
          ['Total Revenue', `$${revenueData?.metrics?.totalRevenue?.toLocaleString() || '0'}`],
          ['Active Subscriptions', `${revenueData?.metrics?.activeSubscriptions || '0'}`],
          ['Conversion Rate', `${revenueData?.metrics?.conversionRate || '0.0%'}`],
          ['Monthly Revenue', `${revenueData?.metrics?.powerConsumption || '$0'}`]
        ];

        autoTable(doc, {
          startY: 55,
          head: [['Metric', 'Value']],
          body: metrics,
          theme: 'grid',
          headStyles: { fillColor: [255, 114, 34] }
        });

        // Subscriptions
        doc.setFontSize(14);
        doc.text('ACTIVE SUBSCRIPTIONS', 20, doc.lastAutoTable.finalY + 20);

        const subscriptions = (revenueData?.subscriptions || [])
          .filter(sub => sub.role !== 'admin')
          .filter(sub => filterPlan === 'all' || sub.planName?.toLowerCase().includes(filterPlan))
          .filter(sub => filterBilling === 'all' || sub.billingCycle === filterBilling)
          .map(sub => [
            sub.userName || 'Unknown',
            sub.planName || 'Basic',
            sub.billingCycle || 'monthly',
            `$${sub.amount || '0'}`,
            new Date(sub.endDate).toLocaleDateString()
          ]);

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 25,
          head: [['User', 'Plan', 'Billing', 'Revenue', 'Expires']],
          body: subscriptions,
          theme: 'striped',
          headStyles: { fillColor: [255, 114, 34] }
        });

        doc.save(`fitness-tracker-revenue-${new Date().toISOString().split('T')[0]}.pdf`);
        return { success: true };
      } catch (error) {
        console.error('PDF Generation Error:', error);
        setError('Failed to generate PDF report');
        return { success: false, message: error.message };
      }
    },
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
  // Generate PDF report
  const generatePDFReport = async (filterPlan, filterBilling, chartFilter) => {
    try {
      const response = await fetch(`${API_BASE}/revenue/generate-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filterPlan,
          filterBilling,
          chartFilter
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data.report, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      setError('Report generation failed');
      return { success: false, message: error.message };
    }
  };