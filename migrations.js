const logger = require('./logger').globalLogger;
const path = require('path');

var sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join(__dirname, 'jobs.db'));

const { CommandsRunner, SQLite3Driver } = require('node-db-migration');
const migrations = new CommandsRunner({
    driver: new SQLite3Driver(db),
    directoryWithScripts: path.join(__dirname, 'migrations'),
    logger: {
        success: (msg) => logger.info(msg),
        info: (msg) => logger.info(msg),
        infoParams: (msg) => logger.info(msg),
        infoParamsColor: (msg) => logger.info(msg),
        colors: {},
    },
});

module.exports = {
    async run() {
        try {
            await migrations.doInit();
            await migrations.findAndRunMigrations(false);
            return true;
        } catch (e) {
            logger.error(`Failed to execute the database migrations: ${e}, ${e.stack}`);
        }
        return false;
    },

    async down() {},
};
