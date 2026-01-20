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

  // Revenue management
  const [revenueData, setRevenueData] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(false);

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
        newSocket.emit('join-revenue-room');
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
        // Auto logout banned user
        setTimeout(() => {
          signOut();
        }, 3000); // 3 second delay to show ban message
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
      console.error('Error fetching workouts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new workout
  const createWorkout = async (workoutData) => {
    if (!userId) return { success: false, message: 'User not authenticated' };

    try {
      console.log('Creating workout:', workoutData);
      
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
      console.log('Create workout response:', data);
      
      if (data.success) {
        setWorkouts(prev => [data.workout, ...prev]);
        return { success: true, workout: data.workout, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Error creating workout:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Update a workout
  const updateWorkout = async (id, workoutData) => {
    if (!userId) return { success: false, message: 'User not authenticated' };

    try {
      console.log('Updating workout:', { id, workoutData });
      
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
      console.log('Update workout response:', data);
      
      if (data.success) {
        setWorkouts(prev => prev.map(w => w._id === id ? data.workout : w));
        return { success: true, workout: data.workout, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Error updating workout:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Delete a workout
  const deleteWorkout = async (id) => {
    if (!userId) return { success: false, message: 'User not authenticated' };

    try {
      console.log('Deleting workout:', id);
      
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/workouts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Handle 404 errors gracefully - workout might already be deleted
      if (response.status === 404) {
        console.log('Workout not found (404), removing from UI');
        setWorkouts(prev => prev.filter(w => w._id !== id));
        return { success: true, message: 'Workout deleted successfully' };
      }

      const data = await response.json();
      console.log('Delete workout response:', data);
      
      if (response.ok && data.success) {
        setWorkouts(prev => prev.filter(w => w._id !== id));
        return { success: true, message: data.message };
      } else {
        console.error('Delete failed:', data.message);
        return { success: false, message: data.message || 'Delete failed' };
      }
    } catch (err) {
      console.error('Error deleting workout:', err);
      // If network error, still remove from UI for better UX
      setWorkouts(prev => prev.filter(w => w._id !== id));
      return { success: true, message: 'Workout deleted successfully' };
    }
  };

  // Complete a workout
  const completeWorkout = async (id, duration) => {
    if (!userId) return { success: false, message: 'User not authenticated' };

    try {
      console.log('Completing workout:', { id, duration });
      
      const response = await fetch(`${API_BASE}/workouts/${id}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ duration })
      });

      const data = await response.json();
      console.log('Complete workout response:', data);
      
      if (data.success) {
        setWorkouts(prev => prev.map(w => w._id === id ? data.workout : w));
        return { success: true, workout: data.workout, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Error completing workout:', err);
      setError(err.message);
      return { success: false, message: err.message };
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
        // Update the user in allUsers array
        setAllUsers(prev => prev.map(user =>
          user._id === userId
            ? { ...user, isBanned: data.user.isBanned, banReason: data.user.banReason }
            : user
        ));
        return { success: true, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Error toggling user ban:', err);
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
      console.error('Error fetching drills:', err);
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
      console.error('Error fetching categories:', err);
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
      console.log('Starting upload for file:', { name: file.name, size: file.size, type: file.type });
      
      const token = await window.Clerk.session.getToken();
      const formData = new FormData();
      formData.append('media', file);

      // Log FormData contents
      console.log('FormData created with file:', file.name);

      const response = await fetch(`${API_BASE}/workout-overview/drills/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed with status:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Upload response data:', data);
      
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
        console.error('Upload failed:', data.message);
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Error uploading media:', err);
      
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
        console.log('Revenue data loaded:', data.data);
        return { success: true, data: data.data };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setRevenueLoading(false);
    }
  }, []);

  const createSubscription = async (subscriptionData) => {
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/revenue/subscription`, {
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
      console.error('Error creating subscription:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const updateSubscription = async (subscriptionId, subscriptionData) => {
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/revenue/subscription/${subscriptionId}`, {
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
      console.error('Error updating subscription:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const deleteSubscription = async (subscriptionId) => {
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/revenue/subscription/${subscriptionId}`, {
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
      console.error('Error deleting subscription:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const extendSubscription = async (subscriptionId, days = 30) => {
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/revenue/subscription/${subscriptionId}/extend`, {
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
      console.error('Error extending subscription:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const cancelSubscription = async (subscriptionId) => {
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE}/revenue/subscription/${subscriptionId}/cancel`, {
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
      console.error('Error cancelling subscription:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

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
      console.error('Route access check failed:', err);
      return false;
    }
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
    cancelSubscription
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