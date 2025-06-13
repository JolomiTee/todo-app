const User = require("../models/User");

exports.register = async (req, res, next) => {
	try {
		const { username, password } = req.body;
		const user = await User.create({ username, password });
		req.session.userId = user._id;
		res.redirect("/tasks");
	} catch (err) {
		next(err);
	}
};

exports.login = async (req, res, next) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		if (!user || !(await user.comparePassword(password))) {
			return res.render("login", { error: "Invalid credentials" });
		}
		req.session.userId = user._id;
		res.redirect("/tasks");
	} catch (err) {
		next(err);
	}
};

exports.logout = (req, res) => {
	req.session.destroy(() => res.redirect("/login"));
};
