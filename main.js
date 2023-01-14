import { existsSync } from 'fs';
import dotenv from 'dotenv';

import Bree from 'bree';
import { globalLogger } from './logger.js';
import * as server from './server.js';
import * as store from './store.js';
import * as migrations from './migrations.js';

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

let externalConfig = {};

if (existsSync('./external-jobs/config.js')) {
    externalConfig = await import('./external-jobs/config.js');
}

// example jobs used as fallback if the external config doesn't exist
let jobs = [
    {
        name: 'log-message',
        interval: '30s',
    },
    {
        name: 'log-message2',
        interval: '45s',
    },
    {
        name: 'log-message3',
    },
];

const bree = new Bree({
    logger: globalLogger,
    root: externalConfig.root || join(__dirname, 'jobs'),
    jobs: externalConfig.jobs || jobs,
    workerMessageHandler() {
        // handle custom worker messages
        if (externalConfig.workerMessageHandler) {
            externalConfig.workerMessageHandler.apply(this, arguments);
        }
    },
});

async function main() {
    const result = await migrations.run();

    if (!result) {
        process.exit(1);
    }

    store.init(bree);

    bree.start();
    server.start();
}

main().catch(globalLogger.error);
