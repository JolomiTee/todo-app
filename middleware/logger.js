const winston = require("winston");

const logger = winston.createLogger({
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: "./logs/app.log" }),
	],
});

logger.stream = {
	write: (message) => logger.info(message.trim()),
};

module.exports = logger;
