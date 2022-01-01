const { parentPort } = require('worker_threads');
var logger = require('../logger');

// job logic
logger.error('Something happned');

let timeoutId = setTimeout(() => {
    logger.info('Finished');

    // signal to parent that the job is done
    done();
}, 15000);

function done() {
    if (parentPort) {
        parentPort.postMessage('done');
    } else {
        process.exit(0);
    }
}
function cancel() {
    // cleanup for the current job
    clearTimeout(timeoutId);

    if (parentPort) {
        parentPort.postMessage('cancelled');
    } else {
        process.exit(0);
    }
}

if (parentPort) {
    parentPort.once('message', (message) => {
        if (message === 'cancel') {
            return cancel();
        }
    });
}
