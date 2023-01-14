import { readFileSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { Umzug } from 'umzug';
import { globalLogger as logger } from './logger';

class SQLiteClient {
    constructor() {
        const Database = require('better-sqlite3');
        this.db = new Database(join(__dirname, 'jobs.db'));
    }
    async exec(sql) {
        return this.db.exec(sql);
    }
    async run(sql, params) {
        return this.db.prepare(sql).run(...params);
    }
    async get(sql, params) {
        return this.db.prepare(sql).all(...params);
    }
}

const umzug = new Umzug({
    migrations: {
        glob: 'migrations/*.sql',
        resolve: ({ name, path: filePath, context }) => ({
            name,
            up: async () => {
                const sql = readFileSync(filePath, 'utf8');

                if (!sql) {
                    logger.info(`No sql instructions found for ${name}`);
                    return;
                }

                return context.exec(sql);
            },
            down: async () => {
                const downPath = join(dirname(filePath), 'down', basename(filePath));

                if (!existsSync(downPath)) {
                    logger.info(`No corresponding down migration found for ${name}`);
                    return;
                }

                const sql = readFileSync(downPath, 'utf8');

                if (!sql) {
                    logger.info(`No sql instructions found for ${name}`);
                    return;
                }

                return context.exec(sql);
            },
        }),
    },
    storage: {
        async executed({ context }) {
            await context.exec(`CREATE TABLE IF NOT EXISTS migrations(name TEXT)`);
            const results = await context.get(`SELECT name FROM migrations`, []);
            return results.map((r) => r.name);
        },
        async logMigration({ name, context: client }) {
            await client.run(`INSERT INTO migrations(name) VALUES (?)`, [name]);
        },
        async unlogMigration({ name, context: client }) {
            await client.run(`DELETE FROM migrations WHERE name = ?`, [name]);
        },
    },
    context: new SQLiteClient(),
    logger: {
        info: (msg) => {
            if (typeof msg == 'object') {
                logger.info(JSON.stringify(msg));
                return;
            }
            logger.info(msg);
        },
    },
    create: {
        folder: 'migrations',
    },
});

export async function run() {
    try {
        await umzug.up();
        logger.info('Completed the migrations.');
        return true;
    } catch (e) {
        logger.error(`Failed to execute the database migrations: ${e}, ${e.stack}`);
    }
    return false;
}
export async function down() {
    try {
        const migration = await umzug.down();
        logger.info(`Removed ${migration.name} from the completed list`);
    } catch (e) {
        logger.error(`Failed to revert the database migration: ${e}, ${e.stack}`);
    }
}
export async function create(name) {
    await umzug.create({ name });
}

if (require.main === module) {
    umzug.runAsCLI();
}
