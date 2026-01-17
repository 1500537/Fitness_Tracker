import Nutrition from "../models/nutritionModal.js";

// Get all nutrition entries for a user
export const getNutrition = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date } = req.query;

    let query = { userId };

    // Filter by date if provided
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const nutrition = await Nutrition.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: nutrition,
      message: "Nutrition data retrieved successfully"
    });
  } catch (error) {
    console.error("Get nutrition error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve nutrition data",
      error: error.message
    });
  }
};

// Add new nutrition entry
export const addNutrition = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, type, protein, carbs, fats } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid name"
      });
    }
    if (!type || !['Breakfast', 'Lunch', 'Dinner', 'Snacks'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meal type"
      });
    }
    const proteinNum = parseFloat(protein);
    if (isNaN(proteinNum) || proteinNum < 0 || proteinNum > 500) {
      return res.status(400).json({
        success: false,
        message: "Invalid protein"
      });
    }
    const carbsNum = parseFloat(carbs || 0);
    if (isNaN(carbsNum) || carbsNum < 0 || carbsNum > 1000) {
      return res.status(400).json({
        success: false,
        message: "Invalid carbs"
      });
    }
    const fatsNum = parseFloat(fats || 0);
    if (isNaN(fatsNum) || fatsNum < 0 || fatsNum > 500) {
      return res.status(400).json({
        success: false,
        message: "Invalid fats"
      });
    }

    // Calculate calories
    const calories = (proteinNum * 4) + (carbsNum * 4) + (fatsNum * 9);

    // Get current time
    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    const nutritionEntry = new Nutrition({
      userId,
      name: name.trim(),
      type,
      protein: proteinNum,
      carbs: carbsNum,
      fats: fatsNum,
      calories,
      time
    });

    const savedEntry = await nutritionEntry.save();

    res.status(201).json({
      success: true,
      data: savedEntry,
      message: "Nutrition entry added successfully"
    });
  } catch (error) {
    console.error("Add nutrition error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add nutrition entry",
      error: error.message
    });
  }
};

// Update nutrition entry
export const updateNutrition = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { name, type, protein, carbs, fats } = req.body;

    // Find and update the entry
    const nutritionEntry = await Nutrition.findOne({ _id: id, userId });

    if (!nutritionEntry) {
      return res.status(404).json({
        success: false,
        message: "Nutrition entry not found"
      });
    }

    // Update fields
    if (name) nutritionEntry.name = name.trim();
    if (type) nutritionEntry.type = type;
    if (protein !== undefined) nutritionEntry.protein = Number(protein);
    if (carbs !== undefined) nutritionEntry.carbs = Number(carbs);
    if (fats !== undefined) nutritionEntry.fats = Number(fats);

    // Recalculate calories
    nutritionEntry.calories = (nutritionEntry.protein * 4) + (nutritionEntry.carbs * 4) + (nutritionEntry.fats * 9);

    const updatedEntry = await nutritionEntry.save();

    res.status(200).json({
      success: true,
      data: updatedEntry,
      message: "Nutrition entry updated successfully"
    });
  } catch (error) {
    console.error("Update nutrition error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update nutrition entry",
      error: error.message
    });
  }
};

// Delete nutrition entry
export const deleteNutrition = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const deletedEntry = await Nutrition.findOneAndDelete({ _id: id, userId });

    if (!deletedEntry) {
      return res.status(404).json({
        success: false,
        message: "Nutrition entry not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Nutrition entry deleted successfully"
    });
  } catch (error) {
    console.error("Delete nutrition error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete nutrition entry",
      error: error.message
    });
  }
};

// Get nutrition statistics
export const getNutritionStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date } = req.query;

    let matchQuery = { userId };

    // Filter by date if provided
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      matchQuery.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const stats = await Nutrition.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalCalories: { $sum: "$calories" },
          totalProtein: { $sum: "$protein" },
          totalCarbs: { $sum: "$carbs" },
          totalFats: { $sum: "$fats" },
          mealCount: { $sum: 1 },
          mealsByType: {
            $push: {
              type: "$type",
              calories: "$calories"
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      mealCount: 0,
      mealsByType: []
    };

    res.status(200).json({
      success: true,
      data: result,
      message: "Nutrition statistics retrieved successfully"
    });
  } catch (error) {
    console.error("Get nutrition stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve nutrition statistics",
      error: error.message
    });
  }
};
