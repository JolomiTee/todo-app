const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/jwt");

const signup = async (req, res) => {
	try {
		const { username, email_address, password } = req.body;

		const existingUser = await User.findOne({ email_address });
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}

		const user = await User.create({
			username,
			email_address,
			password,
		});

		const token = generateToken(user);

		res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });

		res.redirect("/tasks?signup=success");
		// testing with postman
		// res.status(201).json({
		// 	token,
		// 	message: "New user created",
		// });
	} catch (error) {
		res.status(500).json({
			message: "Error creating user",
			error: error.message,
		});
	}
};

const login = async (req, res) => {
	try {
		const { email_address, password } = req.body;

		const user = await User.findOne({ email_address });
		if (!user) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const token = generateToken(user);
		res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
		res.redirect("/tasks?login=true");
	} catch (error) {
		res.status(500).json({
			message: "Error logging in",
			error: error.message,
		});
	}
};

const logout = async (req, res) => {
	res.clearCookie("token");

	res.redirect("/?logout=true");

	// res.status(200).json({
	// 	message: "User logged out",
	// });
};
module.exports = {
	signup,
	login,
	logout,
};
