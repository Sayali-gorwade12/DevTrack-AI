const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// GET actual dashboard statistics from MongoDB
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const db = req.app.locals.db;

      const [
        totalUsers,
        totalProjects,
        totalTeams,
        totalTasks,
        totalBugs,
      ] = await Promise.all([
        db.collection("users").countDocuments(),
        db.collection("projects").countDocuments(),
        db.collection("teams").countDocuments(),
        db.collection("tasks").countDocuments(),
        db.collection("bugs").countDocuments(),
      ]);

      res.json({
        success: true,
        stats: {
          totalUsers,
          totalProjects,
          totalTeams,
          totalTasks,
          totalBugs,
        },
      });
    } catch (error) {
      console.error("Admin Stats Error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard statistics",
      });
      
    }
  }
);

module.exports = router;