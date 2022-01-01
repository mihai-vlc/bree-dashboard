# Bree dashboard

A simple nodejs application to run and display bree jobs.

Bree: https://github.com/breejs/bree

![dashboard](./screenshots/dashboard.png)

## Install

```
git clone https://github.com/ionutvmi/bree-dashboard.git
pnpm install
pnpm run start
```

## Workers

Example worker for an asynchronous flow:

```
let AbstractWorker = require('../worker/AbstractWorker');

class Worker extends AbstractWorker {
    async run() {
        return new Promise((resolve, reject) => {
            this.logger.info('Starting the execution !');

            this.timeoutId = setTimeout(() => {
                this.logger.info('Finished');
                resolve('CUSTOM_SUCCESS');
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

```

For synchronous flow:

```
let AbstractWorker = require('../worker/AbstractWorker');

class Worker extends AbstractWorker {
    async run() {
        this.logger.info('Message logged right away.');

        if (Math.random() > 0.5) {
            return 'ERROR';
        }

        return 'EXECUTION_SUCCESSFUL';
    }
}

let worker = new Worker(__filename);
worker.start().catch(function (e) {
    console.error(e);
});
```

## Logs

The logs for the workers are stored in 2 locations:

-   on the disk in a file named log.txt
-   in a sqlite database jobs.db (for each execution)

When clicking on an execution log the information is displayed from the sqlite database file.
![execution-log](./screenshots/execution-log.png)

## Release notes

Jan 1st 2022 - Initial release

## Author

Mihai Ionut Vilcu

-   [github/ionutvmi](https://github.com/ionutvmi)
-   [twitter/mihaivlc93](http://twitter.com/mihaivlc93)
