let AbstractWorker = require('../worker/AbstractWorker');

class Worker extends AbstractWorker {
    async run() {
        return new Promise((resolve, reject) => {
            this.logger.info('Starting the execution !');

            this.timeoutId = setTimeout(() => {
                this.logger.info('Finished');
                resolve();
            }, 15000);
        });
    }
    async onCancel() {
        clearTimeout(this.timeoutId);
    }
}

let worker = new Worker(__filename);
worker.start().catch(function (e) {
    console.error(e);
});
