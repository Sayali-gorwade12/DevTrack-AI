const express = require("express");
const { ObjectId } = require("mongodb");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// GET all projects accessible to the logged-in user
router.get(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const db = req.app.locals.db;
      const projects = db.collection("projects");

      let query = {};

      // Developers see only projects assigned to them.
      if (req.user.role === "developer") {
        query = {
          $or: [
            { developerIds: req.user.id },
            { developerIds: new ObjectId(req.user.id) },
            { "members.userId": req.user.id },
            { "members.userId": new ObjectId(req.user.id) },
          ],
        };
      }

      // Managers see only projects assigned to them.
      if (req.user.role === "manager") {
        query = {
          $or: [
            { managerId: req.user.id },
            { managerId: new ObjectId(req.user.id) },
          ],
        };
      }

      const result = await projects.find(query).toArray();

      res.json({
        count: result.length,
        projects: result,
      });
    } catch (error) {
      console.error("Get Projects Error:", error);
      res.status(500).json({
        message: "Failed to fetch projects",
      });
    }
  }
);

// CREATE a project: Admin or Manager only
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  async (req, res) => {
    try {
      const { name, description, status, deadline } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          message: "Project name is required",
        });
      }

      const db = req.app.locals.db;

      const newProject = {
        name: name.trim(),
        description: description?.trim() || "",
        status: status || "active",
        deadline: deadline ? new Date(deadline) : null,
        createdBy: req.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection("projects").insertOne(newProject);

      res.status(201).json({
        message: "Project created successfully",
        project: {
          _id: result.insertedId,
          ...newProject,
        },
      });
    } catch (error) {
      console.error("Create Project Error:", error);
      res.status(500).json({
        message: "Failed to create project",
      });
    }
  }
);

// UPDATE project: Admin or Manager only
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  async (req, res) => {
    try {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          message: "Invalid project ID",
        });
      }

      const { name, description, status, deadline } = req.body;
      const updates = {};

      if (name !== undefined) {
        if (!name.trim()) {
          return res.status(400).json({
            message: "Project name cannot be empty",
          });
        }
        updates.name = name.trim();
      }

      if (description !== undefined) {
        updates.description = description.trim();
      }

      if (status !== undefined) {
        updates.status = status;
      }

      if (deadline !== undefined) {
        updates.deadline = deadline ? new Date(deadline) : null;
      }

      updates.updatedAt = new Date();

      const db = req.app.locals.db;
      const result = await db.collection("projects").updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: updates }
      );

      if (!result.matchedCount) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      res.json({
        message: "Project updated successfully",
      });
    } catch (error) {
      console.error("Update Project Error:", error);
      res.status(500).json({
        message: "Failed to update project",
      });
    }
  }
);

module.exports = router;