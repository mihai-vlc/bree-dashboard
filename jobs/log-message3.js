let AbstractWorker = require('../worker/AbstractWorker');

class Worker extends AbstractWorker {
    async run() {
        this.logger.info('Something happened !');
    }
}

let worker = new Worker(__filename);
worker.start().catch(function (e) {
    console.error(e);
});
