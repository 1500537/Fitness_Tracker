import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { io } from 'socket.io-client';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { userId, isLoaded } = useAuth();
  const { signOut } = useClerk();
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
  const API_BASE = 'http://localhost:3000/api';

  // Admin drill management
  const [drills, setDrills] = useState([]);
  const [drillsLoading, setDrillsLoading] = useState(false);

  // Admin category management
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Socket for real-time drill updates
  useEffect(() => {
    if (isLoaded && userId) {
      const newSocket = io('http://localhost:3000', {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('Connected to server');
        newSocket.emit('join-user-room', userId);
        newSocket.emit('join-workouts-room');
        newSocket.emit('join-categories-room');
      });

      // Real-time drill updates
      newSocket.on('drillCreated', (drill) => {
        setDrills(prev => [drill, ...prev]);
      });

      newSocket.on('drillUpdated', (drill) => {
        setDrills(prev => prev.map(d => d._id === drill._id ? drill : d));
      });

      newSocket.on('drillDeleted', (id) => {
        setDrills(prev => prev.filter(d => d._id !== id));
      });

      // Real-time category updates
      newSocket.on('categoryCreated', (category) => {
        setCategories(prev => [category, ...prev]);
      });

      newSocket.on('categoryUpdated', (category) => {
        setCategories(prev => prev.map(c => c._id === category._id ? category : c));
      });

      newSocket.on('categoryDeleted', (id) => {
        setCategories(prev => prev.filter(c => c._id !== id));
      });

      // Handle real-time ban notification
      newSocket.on('user-banned', (banData) => {
        console.log('User banned:', banData);
        setBanAlert(banData);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isLoaded, userId]);

  // Fetch workouts for the current user
  const fetchWorkouts = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/workouts`, {
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

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
  };

  // Create a new workout
  const createWorkout = async (workoutData) => {
    if (!userId) return;

    try {
      const response = await fetch(`${API_BASE}/workouts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workoutData)
      });

      const data = await response.json();
      if (data.success) {
        setWorkouts(prev => [data.workout, ...prev]);
        return data.workout;
      } else {
        setError(data.message);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Update a workout
  const updateWorkout = async (id, workoutData) => {
    if (!userId) return;

    try {
      const response = await fetch(`${API_BASE}/workouts/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workoutData)
      });

      const data = await response.json();
      if (data.success) {
        setWorkouts(prev => prev.map(w => w._id === id ? data.workout : w));
        return data.workout;
      } else {
        setError(data.message);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Delete a workout
  const deleteWorkout = async (id) => {
    if (!userId) return false;

    try {
      const response = await fetch(`${API_BASE}/workouts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setWorkouts(prev => prev.filter(w => w._id !== id));
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

  // Complete a workout
  const completeWorkout = async (id, duration) => {
    if (!userId) return null;

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
        return data.workout;
      } else {
        setError(data.message);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Fetch nutrition entries for the current user
  const fetchNutrition = async (date = null) => {
    if (!userId) return;

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
  };

  // Fetch nutrition statistics
  const fetchNutritionStats = async (date = null) => {
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
  };

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
        setProgress(data.progress);
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

  // Fetch user data
  const fetchUser = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${API_BASE}/dashboard/user`, {
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.user);

        // Check if user is banned immediately after fetching user data
        if (data.user.isBanned) {
          console.log('User is banned, setting ban alert');
          setBanAlert({
            message: 'Your account has been suspended',
            reason: data.user.banReason || 'Your account has been suspended. Please contact support.'
          });
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [userId]);

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

  // Load workouts and nutrition when user is authenticated
  useEffect(() => {
    if (isLoaded && userId) {
      fetchWorkouts();
      fetchNutrition();
      fetchNutritionStats();
    }
  }, [userId, isLoaded]);

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
        setProgress(prev => [data.progress, ...prev]);
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
        setAllUsers(prev => prev.map(user =>
          user._id === userId
            ? { ...user, isBanned: banStatus, banReason: banStatus ? banReason : '' }
            : user
        ));
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

  // Drill Management Functions
  const fetchDrills = async () => {
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
      console.error('Error fetching drills:', err);
      setError(err.message);
    } finally {
      setDrillsLoading(false);
    }
  };

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
      console.error('Error creating drill:', err);
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
      console.error('Error updating drill:', err);
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
      console.error('Error deleting drill:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Category Management Functions
  const fetchCategories = async () => {
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
      console.error('Error fetching categories:', err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setCategoriesLoading(false);
    }
  };

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
      console.error('Error creating category:', err);
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
      console.error('Error updating category:', err);
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
        return { success: true, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Error deleting category:', err);
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
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
      console.error('Error uploading media:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Check user ban status
  const checkUserBanStatus = useCallback(async () => {
    if (!userId) return false;

    try {
      const response = await fetch(`${API_BASE}/users/status`, {
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        return false; // User is not banned
      } else if (data.message === 'Account suspended') {
        // User is banned
        setBanAlert({
          message: 'Your account has been suspended',
          reason: data.reason || 'Your account has been suspended. Please contact support.'
        });
        return true; // User is banned
      }
    } catch (err) {
      console.error('Error checking ban status:', err);
    }
    return false;
  }, [API_BASE, userId]);

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
    addProgressEntry,
    updateGoals,
    setError,
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
    checkUserBanStatus,
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
    uploadDrillMedia
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