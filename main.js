import { existsSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

import Bree from 'bree';
import { globalLogger as logger } from './logger';
import server from './server';
import store from './store';
import migrations from './migrations';

dotenv.config();

let externalConfig = {};

if (existsSync('./external-jobs/config.js')) {
    externalConfig = require('./external-jobs/config');
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
    logger: logger,
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

main().catch(logger.error);
