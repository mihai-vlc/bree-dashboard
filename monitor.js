const Database = require('better-sqlite3');
var db = new Database('./jobs.db');

db.prepare(
    `CREATE TABLE IF NOT EXISTS jobsExecution (
    job_id TEXT NOT NULL,
    start_time INTEGER NOT NULL,
    end_time INTEGER NOT NULL
)`
).run();

let runningJobs = {};

module.exports = {
    init(bree) {
        bree.on('worker created', (name) => {
            runningJobs[name] = new Date();
        });

        bree.on('worker deleted', (name) => {
            if (name == undefined) {
                return;
            }

            let startTime = runningJobs[name].getTime();
            let endTime = new Date().getTime();

            delete runningJobs[name];

            db.prepare('INSERT INTO jobsExecution VALUES (?, ?, ?)').run(
                name,
                startTime,
                endTime
            );
        });
    },

    getExecutions(id) {
        let results = db
            .prepare(
                `SELECT rowid, start_time, end_time 
                FROM jobsExecution 
                WHERE job_id = ? 
                ORDER BY start_time DESC`
            )
            .all(id);
        return results.map(function (row) {
            let startTime = new Date(row.start_time);
            let endTime = new Date(row.end_time);
            return {
                id: row.rowid,
                startTime: startTime,
                endTime: endTime,
                duration: endTime - startTime,
            };
        });
    },

    clearExecution(jobId) {
        db.prepare(`DELETE FROM jobsExecution WHERE job_id = ?`).run(jobId);
    },
};
