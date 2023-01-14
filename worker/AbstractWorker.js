import { basename, extname } from 'path';
import { startExecution, endExecution } from '../monitor.js';
import { parentPort } from 'worker_threads';
import logger from '../logger.js';

export default class AbstractWorker {
    constructor(filePath) {
        this.filePath = filePath;
        this.jobId = basename(filePath, extname(filePath));

        if (parentPort) {
            parentPort.once('message', async (message) => {
                if (message === 'cancel') {
                    await this.cancel();
                }
            });
        }
    }

    async start() {
        this.executionId = startExecution(this.jobId);
        this.logger = logger.getLogger(this.jobId, this.executionId);

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
        endExecution(this.executionId, this.resultCode);

        if (parentPort) {
            parentPort.postMessage('done');
        } else {
            process.exit(0);
        }
    }

    async cancel() {
        await this.onCancel();

        this.logger.info('Work cancelled !');

        endExecution(this.executionId);

        if (parentPort) {
            parentPort.postMessage('cancelled');
        } else {
            process.exit(0);
        }
    }
}
