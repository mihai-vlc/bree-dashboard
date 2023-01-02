-- up migration
CREATE TABLE
    IF NOT EXISTS jobsExecution (
        job_id TEXT NOT NULL,
        start_time INTEGER NOT NULL,
        end_time INTEGER,
        result_code TEXT
    );
