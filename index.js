require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const morgan = require("morgan");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth.route");
const taskRoutes = require("./routes/task.route");

const app = express();

mongoose
	.connect(process.env.MONGO_URI)
	.then(() => logger.info("MongoDB connected"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Session setup
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
		cookie: { maxAge: 1000 * 60 * 60 * 24 },
	})
);

app.use(morgan("dev"));
// app.use(logger.stream);

// Routes
app.use("/", authRoutes);
app.use("/tasks", taskRoutes);

// Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
