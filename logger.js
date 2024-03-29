import { format, createLogger, transports } from 'winston';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import wbs from './helpers/winston-db-transport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const myFormat = format.printf(({ level, message, _label, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

export const globalLogger = createLogger({
    level: 'debug',
    format: format.combine(format.timestamp(), myFormat),
    transports: [
        new transports.File({
            filename: 'log.txt',
            dirname: __dirname,
        }),
        new transports.Console(),
    ],
});
export function getLogger(jobId, executionId) {
    return createLogger({
        level: 'debug',
        defaultMeta: {
            job_id: jobId,
            execution_id: executionId,
        },
        format: format.combine(format.timestamp(), myFormat),
        transports: [
            new wbs({
                db: join(__dirname, 'jobs.db'),
                params: ['level', 'message', 'job_id', 'execution_id'],
            }),
            new transports.File({
                filename: 'log.txt',
                dirname: __dirname,
            }),
            new transports.Console(),
        ],
    });
}
