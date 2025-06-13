const winston = require("winston");
const { format } = winston;
const { combine, timestamp, printf, colorize, errors, json } = format;

// Define a custom log format
const logFormat = printf(({ level, message, timestamp, stack, service, ...metadata }) => {
	let log = `${timestamp} [${service || 'app'}] ${level}: ${stack || message}`;
	if (metadata && Object.keys(metadata).length > 0) {
		// Only stringify metadata if it's not empty, to avoid " {}" at the end of logs
		if (Object.keys(metadata).length > 0) {
			log += ` ${JSON.stringify(metadata)}`;
		}
	}
	return log;
});

const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || "info", // Default to 'info'
	format: combine(
		timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		errors({ stack: true }), // This will handle the stack trace for error objects
		json() // Logs in JSON format, which is good for structured logging
	),
	defaultMeta: { service: "user-service" }, // Default service tag
	transports: [
		new winston.transports.Console({
			format: combine(
				colorize(), // Colorize logs for the console
				// Re-apply timestamp and custom printf for console if json() above is too verbose or not desired for console
				timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
				logFormat
			),
		}),
		new winston.transports.File({
			filename: "./logs/app.log",
			format: combine( // File transport will use the default JSON format defined at the logger level
				// If a different format is needed for file, define it here, e.g., without colorize but with logFormat
				// timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
				// logFormat // if you prefer plain text over JSON in file
			)
		}),
		new winston.transports.File({
			filename: "./logs/error.log",
			level: "error",
			// format: combine(...) // specific format for error log file if needed
		}),
	],
});

// Stream for Morgan
logger.stream = {
	write: (message) => {
		// Morgan typically includes a newline, trim it
		// Log HTTP requests with 'http' level to separate from app logs if desired
		logger.http(message.trim());
	},
};

module.exports = logger;
