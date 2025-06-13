const Task = require("../models/Task");
const logger = require("../middleware/logger"); // Added logger

exports.getTasks = async (req, res, next) => {
	try {
		const filter = { user_id: req.user.userId };
		if (req.query.status) {
			filter.status = req.query.status;
		}
		const tasks = await Task.find(filter).sort({ createdAt: -1 }); // Added sort
		res.render("dashboard", { tasks, currentStatus: req.query.status, user: req.user });
	} catch (err) {
		logger.error(`Error fetching tasks for user ${req.user.userId}: ${err.message}`, { stack: err.stack, userId: req.user.userId, filter: req.query.status });
		next(err);
	}
};

exports.createTask = async (req, res, next) => {
	try {
		// Ensure description is included, matching the form and previous route logic
		const task = await Task.create({ // capture the created task
			user_id: req.user.userId,
			title: req.body.title,
			description: req.body.description,
			status: "pending", // Explicitly set status as in original route
		});
		logger.info('Task created successfully', { taskId: task._id, userId: req.user.userId, title: task.title });
		res.redirect("/tasks");
	} catch (err) {
		logger.error(`Error creating task for user ${req.user.userId}: ${err.message}`, { stack: err.stack, userId: req.user.userId, taskData: req.body });
		next(err);
	}
};

exports.updateTaskStatus = async (req, res, next) => {
	try {
		// Using findOneAndUpdate is fine, ensure query uses user_id
		const task = await Task.findOneAndUpdate(
			{ _id: req.params.id, user_id: req.user.userId },
			{ status: req.body.status },
			{ new: true } // Optional: to get the updated document
		);
		if (!task) {
			logger.warn('Task not found or user not authorized for update', { taskId: req.params.id, userId: req.user.userId });
			return res.status(404).send("Task not found or not authorized");
		}
		logger.info('Task status updated', { taskId: req.params.id, newStatus: req.body.status, userId: req.user.userId });
		res.redirect("/tasks");
	} catch (err) {
		logger.error(`Error updating task ${req.params.id} for user ${req.user.userId}: ${err.message}`, { stack: err.stack, taskId: req.params.id, userId: req.user.userId, newStatus: req.body.status });
		next(err);
	}
};

exports.deleteTask = async (req, res, next) => {
	try {
		const task = await Task.findOneAndDelete({ _id: req.params.id, user_id: req.user.userId });
		if (!task) {
			logger.warn('Task not found or user not authorized for deletion', { taskId: req.params.id, userId: req.user.userId });
			return res.status(404).send("Task not found or not authorized");
		}
		logger.info('Task deleted', { taskId: req.params.id, userId: req.user.userId });
		res.redirect("/tasks");
	} catch (err) {
		logger.error(`Error deleting task ${req.params.id} for user ${req.user.userId}: ${err.message}`, { stack: err.stack, taskId: req.params.id, userId: req.user.userId });
		next(err);
	}
};
