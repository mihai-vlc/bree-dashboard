import AbstractWorker from '../worker/AbstractWorker.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

class Worker extends AbstractWorker {
    async run() {
        this.logger.info('Something happened but only once !');
    }
}

let worker = new Worker(__filename);
worker.start().catch(function (e) {
    console.error(e);
});
