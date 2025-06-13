const User = require("../models/User");
const jwt = require("jsonwebtoken");
const logger = require("../middleware/logger"); // Added logger

exports.register = async (req, res, next) => {
	try {
		const { username, password } = req.body;
		const user = await User.create({ username, password });
		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "DEFAULT_JWT_SECRET_REPLACE_THIS", {
			expiresIn: "1h",
		});
		res.cookie("token", token, { httpOnly: true, maxAge: 3600000 }); // 1 hour
		logger.info('User registered successfully', { userId: user._id, username: user.username });
		res.redirect("/tasks");
	} catch (err) {
		// Adding error logging before passing to next error handler
		logger.error(`Error during user registration for ${req.body.username}: ${err.message}`, { stack: err.stack, username: req.body.username });
		next(err);
	}
};

exports.login = async (req, res, next) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		if (!user || !(await user.comparePassword(password))) {
			logger.warn('Failed login attempt', { username: req.body.username });
			return res.render("login", { error: "Invalid credentials" });
		}
		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "DEFAULT_JWT_SECRET_REPLACE_THIS", {
			expiresIn: "1h",
		});
		res.cookie("token", token, { httpOnly: true, maxAge: 3600000 }); // 1 hour
		logger.info('User logged in successfully', { userId: user._id, username: user.username });
		res.redirect("/tasks");
	} catch (err) {
		// Adding error logging
		logger.error(`Error during user login for ${req.body.username}: ${err.message}`, { stack: err.stack, username: req.body.username });
		next(err);
	}
};

exports.logout = (req, res) => {
	// req.user might not be available if token was already cleared or invalid
	// but if it is, log who is logging out.
	const userId = req.user ? req.user.userId : 'unknown';
	logger.info('User logged out', { userId });
	res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
	res.redirect("/login");
};
