let path = require('path');
let monitor = require('../monitor');
const { parentPort } = require('worker_threads');

module.exports = class AbstractWorker {
    constructor(filePath) {
        this.filePath = filePath;
        this.jobId = path.basename(filePath, path.extname(filePath));

        if (parentPort) {
            parentPort.once('message', async (message) => {
                if (message === 'cancel') {
                    await this.cancel();
                }
            });
        }
    }

    async start() {
        this.executionId = monitor.startExecution(this.jobId);
        this.logger = require('../logger').getLogger(this.jobId, this.executionId);

        this.resultCode = null;
        try {
            this.resultCode = await this.run();
        } catch (e) {
            this.resultCode = 'ERROR';
            this.logger.error(e.message + e.stack);
        }
        this.done();
    }

    async run() {
        throw new Error('Missing implementation for the run method !');
    }
    async onCancel() {}

    done() {
        if (this.resultCode == undefined) {
            this.resultCode = 'SUCCESS';
        }
        monitor.endExecution(this.executionId, this.resultCode);

        if (parentPort) {
            parentPort.postMessage('done');
        } else {
            process.exit(0);
        }
    }

    async cancel() {
        await this.onCancel();

        this.logger.info('Work cancelled !');

        monitor.endExecution(this.executionId);

        if (parentPort) {
            parentPort.postMessage('cancelled');
        } else {
            process.exit(0);
        }
    }
};
