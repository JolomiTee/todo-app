const Task = require("../models/Task");

exports.getTasks = async (req, res, next) => {
	try {
		const filter = req.query.status ? { status: req.query.status } : {};
		const tasks = await Task.find({ user_id: req.session.userId, ...filter });
		res.render("dashboard", { tasks });
	} catch (err) {
		next(err);
	}
};

exports.createTask = async (req, res, next) => {
	try {
		await Task.create({
			user_id: req.session.userId,
			title: req.body.title,
			description: req.body.description,
		});
		res.redirect("/tasks");
	} catch (err) {
		next(err);
	}
};

exports.updateTaskStatus = async (req, res, next) => {
	try {
		await Task.findOneAndUpdate(
			{ _id: req.params.id, user_id: req.session.userId },
			{ status: req.body.status }
		);
		res.redirect("/tasks");
	} catch (err) {
		next(err);
	}
};
