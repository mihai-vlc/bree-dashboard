# Bree dashboard

A simple nodejs application to run and display bree jobs.

Bree: https://github.com/breejs/bree

![dashboard](./screenshots/dashboard.png)

## Install

```
git clone https://github.com/mihai-vlc/bree-dashboard.git
cd bree-dashboard
npm install
npm run start
```

To change the port of the server set the `BREE_DASHBOARD_PORT` environment variable.

## Configure

The following environment variables can be used to customize the setup of the dashboard:

```
BREE_DASHBOARD_PORT=3000
BREE_DASHBOARD_HOST=127.0.0.1
BREE_DASHBOARD_SESSION_SECRET=Lm4AMjYkKnX5HpfqMVNRDK9vzke3CARv

BREE_DASHBOARD_BASIC_AUTH=true
BREE_DASHBOARD_USERNAME=admin
BREE_DASHBOARD_PASSWORD=12345
```

They environment is loaded via the `dotenv` package.

Use `0.0.0.0` as the host if you want to expose the service to other computers in the network.

## Define the jobs

The jobs can be created in the `jobs` folder and configured in the `main.js` file.

If you would like to keep the jobs in a separate repository you can create
an `external-jobs/` folder and a file named `external-jobs/config.js` the which
will take priority over the configuration from `main.js`.

```sh
mkdir external-jobs
cd external-jobs
git init
touch config.js
```

The `external-jobs/config.js` file should export an object with job configurations.

```js
// external-jobs/config.js
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const root = __dirname;
export const jobs = [
    {
        name: 'some-job',
        path: path.join(__dirname, 'some-job.js'),
        interval: '10s',
    },
];

export function workerMessageHandler(metadata) {
    console.log('workerMessageHandler', metadata);
}
```

## Workers

Example worker for an asynchronous flow:

```js
import AbstractWorker from '../worker/AbstractWorker.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

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

```js
import AbstractWorker from '../worker/AbstractWorker.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

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

Jan 14th 2023 - 3.0.0

-   Migrated the codebase to ESM

Dec 28th 2022 - 2.0.0

-   Upgrades all dependencies to the latest version

Feb 8th 2022

-   Adds support for enabling basic auth.
-   Documents the environment variables.

Feb 6th 2022

-   Stores the `uikit` library files locally
-   Adds support for changing the server port via environment variables

Jan 8th 2022

-   Upgrades bree to the latest version
-   Adds support for the `external-jobs` folder to allow the maintenance of the jobs
    in a separate repo.

Jan 1st 2022

-   Initial release

## Developing

```sh
git clone https://github.com/mihai-vlc/bree-dashboard.git
npm install
npm run start:dev
```

To make changes to the database structure:

```sh
npm run migration-create
```

The migrations are executed when the application starts.

## Author

Mihai Ionut Vilcu

-   [github/mihai-vlc](https://github.com/mihai-vlc)
-   [twitter/mihai_vlc](http://twitter.com/mihai_vlc)
