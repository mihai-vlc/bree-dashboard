const winston = require('winston');

const myFormat = winston.format.printf(
    ({ level, message, label, timestamp }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    }
);

module.exports = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(winston.format.timestamp(), myFormat),
    transports: [
        new winston.transports.File({ filename: 'log.txt' }),
        new winston.transports.Console(),
    ],
});
