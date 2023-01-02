const { existsSync } = require('fs');
const { join } = require('path');

const logger = require('./logger').globalLogger;

var sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(join(__dirname, 'jobs.db'));
const migrationsFolder = join(__dirname, 'migrations');

const { CommandsRunner, SQLite3Driver } = require('node-db-migration');
const migrations = new CommandsRunner({
    driver: new SQLite3Driver(db),
    directoryWithScripts: join(migrationsFolder, 'up'),
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

    async down() {
        try {
            const completedMigrations = await migrations.getCompletedMigrations(false);

            if (completedMigrations.length == 0) {
                logger.info('No completed migrations found');
                return;
            }

            const lastMigration = completedMigrations.pop();
            const fileName = lastMigration.name.replace(/\.up\.sql$/, '.down.sql');
            const fullPath = join(migrationsFolder, 'down', fileName);

            if (existsSync(fullPath)) {
                const query = await migrations.getScriptStr(join('..', 'down', fileName));
                const error = await migrations.driver.executeMultipleStatements(query);

                if (error) {
                    throw new Error(error);
                }
                logger.info(`Executed ${fullPath} successfully !`);
            } else {
                logger.info(`${fullPath} was not found !`);
            }

            await migrations.runSql(
                `DELETE FROM ${migrations.driver.migrationTable} WHERE id = ?`,
                [lastMigration.id]
            );
            logger.info(`Removed ${lastMigration.name} from the completed list`);
        } catch (e) {
            logger.error(`Failed to execute the database migrations: ${e}, ${e.stack}`);
        }
    },
};
