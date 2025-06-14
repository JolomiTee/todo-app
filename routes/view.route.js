const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
	console.log(req.user);
	res.render("home", {
		error: null,
		title: "Welcome to the Task Manager App",
		user: req.user
			? {
					username: `${req.user.username}`,
					email_address: req.user.email_address,
			  }
			: "No logged in user",
	});
});

// Register - GET
router.get("/register", (req, res) => {
	res.render("register", { error: null, user: req.user
		? {
				username: `${req.user.username}`,
				email_address: req.user.email_address,
		  }
		: "No logged in user", title: "Register" });
});

// Login - GET
router.get("/login", (req, res) => {
	res.render("login", {
		error: null,
		user: req.user
			? {
					username: `${req.user.username}`,
					email_address: req.user.email_address,
			  }
			: "No logged in user",
		title: "Login",
	});
});

module.exports = router;