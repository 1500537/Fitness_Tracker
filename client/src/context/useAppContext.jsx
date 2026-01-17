import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { userId, isLoaded } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [nutrition, setNutrition] = useState([]);
  const [progress, setProgress] = useState([]);
  const [goals, setGoals] = useState({ type: 'bench', value: 100 });
  const [dashboard, setDashboard] = useState(null);
  const [nutritionStats, setNutritionStats] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    mealCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API base URL
  const API_BASE = 'http://localhost:3000/api';

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

  const value = {
    workouts,
    nutrition,
    nutritionStats,
    loading,
    error,
    dashboard,
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
    addProgressEntry,
    updateGoals,
    setError
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