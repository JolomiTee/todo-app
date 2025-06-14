const express = require("express");
const { logout, login, signup } = require("../controllers/auth.controller");
const router = express.Router();

// Register - POST
router.post("/register", signup);

// Login - POST
router.post("/login", login);

// Logout
router.post("/logout", logout);

module.exports = router;
