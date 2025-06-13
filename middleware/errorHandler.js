const logger = require("./logger"); // Assuming logger is in the same directory

module.exports = (err, req, res, next) => {
	// Log the error
	logger.error(err.message, {
		stack: err.stack,
		status: err.status || 500,
		url: req.originalUrl,
		method: req.method,
		ip: req.ip
	});

	let statusCode = err.status || 500;
	let message = err.message || "Something went wrong.";

	// Handle specific Mongoose validation errors
	if (err.name === "ValidationError") {
		statusCode = 400; // Bad Request
		// Optionally, format a more specific message from Mongoose errors
		// For example: Object.values(err.errors).map(e => e.message).join(', ');
		message = "Validation Error: " + Object.values(err.errors).map(e => e.message).join(', ');
	}

	// Handle Mongoose CastError (e.g., invalid ObjectId)
	if (err.name === "CastError" && err.path && err.value) {
		statusCode = 400; // Bad Request
		message = `Invalid format for ${err.path}: ${err.value}`;
	}

	res.status(statusCode);

	// Content negotiation
	if (req.accepts("json")) {
		const jsonError = { message };
		if (process.env.NODE_ENV === "development" && err.stack) {
			jsonError.stack = err.stack;
		}
		res.json(jsonError);
	} else {
		// For HTML requests, render the error page
		// Ensure error object passed to view contains necessary properties
		// Also pass NODE_ENV for conditional stack trace in EJS
		res.render("error", {
			message: message,
			error: { // Pass a structured error object
				status: statusCode,
				stack: err.stack
			},
			NODE_ENV: process.env.NODE_ENV
		});
	}
};
