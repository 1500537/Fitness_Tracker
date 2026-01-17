import express from "express";
import { protect } from '../middleware/authMiddleware.js';
import {
  getNutrition,
  addNutrition,
  updateNutrition,
  deleteNutrition,
  getNutritionStats
} from "../controllers/nutritionController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/nutrition - Get all nutrition entries for user
router.get("/", getNutrition);

// GET /api/nutrition/stats - Get nutrition statistics
router.get("/stats", getNutritionStats);

// POST /api/nutrition - Add new nutrition entry
router.post("/", addNutrition);

// PUT /api/nutrition/:id - Update nutrition entry
router.put("/:id", updateNutrition);

// DELETE /api/nutrition/:id - Delete nutrition entry
router.delete("/:id", deleteNutrition);

export default router;