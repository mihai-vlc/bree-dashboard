const Transport = require('winston-transport');
const Database = require('better-sqlite3');

// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
module.exports = class Sqlite3 extends Transport {
    constructor(options) {
        super(options);

        if (!Object.prototype.hasOwnProperty.call(options, 'db')) {
            throw new Error('"db" is required');
        } else {
            this.db = new Database(options.db);
        }

        this.params = options.params || ['level', 'message'];
        this.insertStmt = `INSERT INTO log (${this.params.join(', ')}) VALUES (${this.params
            .map(() => '?')
            .join(', ')})`;

        this.columnsTyped = this.params.map((p) => {
            return p + ' TEXT';
        });
        this.columnsTyped.unshift(
            'id INTEGER PRIMARY KEY',
            "timestamp INTEGER DEFAULT (strftime('%s','now'))"
        );
        this.table = `CREATE TABLE IF NOT EXISTS log (${this.columnsTyped.join(', ')})`;

        this.db.prepare(this.table).run();
        this.insert = this.db.prepare(this.insertStmt);
    }

    log(info, callback) {
        const logParams = info;

        let params = [];
        this.params.forEach((el) => {
            params.push(logParams[el]);
        });

        setImmediate(() => {
            this.emit('logged', info);
        });

        this.insert.run(params);

        // Perform the writing to the remote service
        callback();
    }
};
