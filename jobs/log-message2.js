let AbstractWorker = require('../worker/AbstractWorker');

class Worker extends AbstractWorker {
    async run() {
        this.logger.info('Message logged right away.');
    }
}

let worker = new Worker(__filename);
worker.start().catch(function (e) {
    console.error(e);
});
