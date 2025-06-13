const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const { ensureAuthenticated } = require("../middleware/authMiddleware");

// Middleware to protect all task routes
router.use(ensureAuthenticated);

// GET tasks with optional filtering
router.get("/", taskController.getTasks);

// Create task
router.post("/", taskController.createTask);

// Update task status
router.post("/:id/status", taskController.updateTaskStatus);

// Delete task
router.post("/:id/delete", taskController.deleteTask);

module.exports = router;
