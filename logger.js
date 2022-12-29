const winston = require('winston');
const path = require('path');

const myFormat = winston.format.printf(({ level, message, _label, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

module.exports = {
    globalLogger: winston.createLogger({
        level: 'debug',
        format: winston.format.combine(winston.format.timestamp(), myFormat),
        transports: [
            new winston.transports.File({
                filename: 'log.txt',
                dirname: __dirname,
            }),
            new winston.transports.Console(),
        ],
    }),
    getLogger(jobId, executionId) {
        const wbs = require('./helpers/winston-db-transport');

        return winston.createLogger({
            level: 'debug',
            defaultMeta: {
                job_id: jobId,
                execution_id: executionId,
            },
            format: winston.format.combine(winston.format.timestamp(), myFormat),
            transports: [
                new wbs({
                    db: path.join(__dirname, 'jobs.db'),
                    params: ['level', 'message', 'job_id', 'execution_id'],
                }),
                new winston.transports.File({
                    filename: 'log.txt',
                    dirname: __dirname,
                }),
                new winston.transports.Console(),
            ],
        });
    },
};
