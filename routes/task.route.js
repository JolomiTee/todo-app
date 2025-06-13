const express = require("express");
const Task = require("../models/task.model");
const { ensureAuthenticated } = require("../middleware/authMiddleware");
const router = express.Router();

// Middleware to protect routes
router.use(ensureAuthenticated);

// GET tasks with optional filtering
router.get("/", async (req, res, next) => {
	try {
		const filter = { user: req.session.userId };
		if (req.query.status) {
			filter.status = req.query.status;
		}

		const tasks = await Task.find(filter).sort({ createdAt: -1 });
		res.render("dashboard", { tasks });
	} catch (err) {
		next(err);
	}
});

// Create task
router.post("/", async (req, res, next) => {
	try {
		const task = new Task({
			user: req.session.userId,
			title: req.body.title,
			status: "pending",
		});
		await task.save();
		res.redirect("/tasks");
	} catch (err) {
		next(err);
	}
});

// Update task status
router.post("/:id/status", async (req, res, next) => {
	try {
		const { status } = req.body;
		await Task.updateOne(
			{ _id: req.params.id, user: req.session.userId },
			{ $set: { status } }
		);
		res.redirect("/tasks");
	} catch (err) {
		next(err);
	}
});

module.exports = router;
