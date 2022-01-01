const winston = require('winston');

const myFormat = winston.format.printf(
    ({ level, message, label, timestamp }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    }
);

module.exports = {
    globalLogger: winston.createLogger({
        level: 'debug',
        format: winston.format.combine(winston.format.timestamp(), myFormat),
        transports: [
            new winston.transports.File({ filename: 'log.txt' }),
            new winston.transports.Console(),
        ],
    }),
    getLogger(jobId, executionId) {
        const wbs = require('./helpers/winston-db-transport');

        return winston.createLogger({
            level: 'debug',
            defaultMeta: {
                jobId: jobId,
                executionId: executionId,
            },
            format: winston.format.combine(
                winston.format.timestamp(),
                myFormat
            ),
            transports: [
                new wbs({
                    db: './jobs.db',
                    params: ['level', 'message', 'jobId', 'executionId'],
                }),
                new winston.transports.File({ filename: 'log.txt' }),
                new winston.transports.Console(),
            ],
        });
    },
};
