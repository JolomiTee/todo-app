const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const router = express.Router();

// Register - GET
router.get("/register", (req, res) => {
	res.render("register", { error: null });
});

// Register - POST
router.post("/register", async (req, res, next) => {
	try {
		const { username, password } = req.body;
		const existingUser = await User.findOne({ username });

		if (existingUser) {
			return res.render("register", { error: "Username already exists" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = new User({ username, password: hashedPassword });
		await user.save();
		req.session.userId = user._id;
		res.redirect("/tasks");
	} catch (err) {
		next(err);
	}
});

// Login - GET
router.get("/login", (req, res) => {
	res.render("login", { error: null });
});

// Login - POST
router.post("/login", async (req, res, next) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });

		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.render("login", { error: "Invalid credentials" });
		}

		req.session.userId = user._id;
		res.redirect("/tasks");
	} catch (err) {
		next(err);
	}
});

// Logout
router.get("/logout", (req, res) => {
	req.session.destroy();
	res.redirect("/login");
});

module.exports = router;
