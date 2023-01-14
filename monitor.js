import Database from 'better-sqlite3';

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var db = new Database(join(__dirname, '/jobs.db'));

export function startExecution(jobId) {
    let result = db
        .prepare('INSERT INTO jobsExecution (job_id, start_time) VALUES (?, ?)')
        .run(jobId, new Date().getTime());

    return result.lastInsertRowid.toFixed();
}
export function endExecution(executionId, resultCode) {
    db.prepare('UPDATE jobsExecution SET end_time = ?, result_code = ? WHERE rowid = ?').run(
        new Date().getTime(),
        resultCode,
        executionId
    );
}
export function getExecutions(jobId) {
    let results = db
        .prepare(
            `SELECT rowid, start_time, end_time, result_code
                FROM jobsExecution
                WHERE job_id = ?
                ORDER BY start_time DESC`
        )
        .all(jobId);
    return results.map(function (row) {
        let startTime = new Date(row.start_time);
        let endTime = null;

        if (row.end_time) {
            endTime = new Date(row.end_time);
        }
        let hasError = row.result_code && row.result_code.indexOf('ERROR') == 0;
        return {
            id: row.rowid,
            startTime: startTime,
            endTime: endTime,
            duration: endTime ? endTime - startTime : 'pending',
            resultCode: row.result_code,
            hasError: hasError,
            style: hasError ? 'color: red' : '',
        };
    });
}
export function clearExecution(jobId) {
    db.prepare(`DELETE FROM jobsExecution WHERE job_id = ?`).run(jobId);
    db.prepare(`DELETE FROM log WHERE job_id = ?`).run(jobId);
}
export function getExecutionLogs(executionId) {
    let results = db
        .prepare(
            `SELECT timestamp, message
            FROM log
            WHERE execution_id = ?
            ORDER BY timestamp ASC`
        )
        .all(executionId);
    return results.map((row) => ({
        timestamp: new Date(row.timestamp),
        level: row.level,
        message: row.message,
    }));
}
