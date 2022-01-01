const Database = require('better-sqlite3');
var db = new Database('./jobs.db');

db.prepare(
    `CREATE TABLE IF NOT EXISTS jobsExecution (
    job_id TEXT NOT NULL,
    start_time INTEGER NOT NULL,
    end_time INTEGER
)`
).run();

module.exports = {
    startExecution(jobId) {
        let result = db
            .prepare(
                'INSERT INTO jobsExecution (job_id, start_time) VALUES (?, ?)'
            )
            .run(jobId, new Date().getTime());

        return result.lastInsertRowid.toFixed();
    },

    endExecution(executionId) {
        db.prepare('UPDATE jobsExecution SET end_time = ? WHERE rowid = ?').run(
            new Date().getTime(),
            executionId
        );
    },

    getExecutions(jobId) {
        let results = db
            .prepare(
                `SELECT rowid, start_time, end_time 
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

            return {
                id: row.rowid,
                startTime: startTime,
                endTime: endTime,
                duration: endTime ? endTime - startTime : 'pending',
            };
        });
    },

    clearExecution(jobId) {
        db.prepare(`DELETE FROM jobsExecution WHERE job_id = ?`).run(jobId);
        db.prepare(`DELETE FROM log WHERE job_id = ?`).run(jobId);
    },

    getExecutionLogs(executionId) {
        let results = db
            .prepare(
                `SELECT timestamp, message 
            FROM log 
            WHERE executionId = ? 
            ORDER BY timestamp ASC`
            )
            .all(executionId);
        return results.map((row) => ({
            timestamp: new Date(row.timestamp),
            level: row.level,
            message: row.message,
        }));
    },
};
