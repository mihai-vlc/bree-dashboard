const fs = require('fs');
const path = require('path');

require('dotenv').config();

const Bree = require('bree');
const logger = require('./logger');
const server = require('./server');
const store = require('./store');

let externalConfig = {};

if (fs.existsSync('./external-jobs/config.js')) {
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
    logger: logger.globalLogger,
    root: externalConfig.root || path.join(__dirname, 'jobs'),
    jobs: externalConfig.jobs || jobs,
    workerMessageHandler() {
        // handle custom worker messages
        if (externalConfig.workerMessageHandler) {
            externalConfig.workerMessageHandler.apply(this, arguments);
        }
    },
});

store.init(bree);
bree.start();
server.start();
