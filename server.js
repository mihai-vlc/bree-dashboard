require('dotenv').config();

const server = require('fastify')({ logger: true });
const POV = require('point-of-view');
let { Liquid } = require('liquidjs');
let path = require('path');

let store = require('./store');
const monitor = require('./monitor');

// Generate Liquid Engine
const engine = new Liquid({
    root: path.join(__dirname, 'views'),
    extname: '.liquid',
});

server.register(POV, {
    engine: {
        liquid: engine,
    },
});

server.register(require('fastify-formbody'));
server.register(require('fastify-cookie'));
server.register(require('@fastify/session'), {
    secret: '12344123441234412344123441234412344',
    cookie: {
        secure: 'auto',
    },
});
server.register(require('fastify-csrf'), { sessionPlugin: 'fastify-session' });

server.register(require('fastify-static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/public/', // optional: default '/'
});

server.get('/', async (request, reply) => {
    let jobs = store.getJobs();
    const csrfToken = await reply.generateCsrf();
    jobs = jobs.map((j) => ({ ...j, csrfToken }));
    let format = request.query.format;

    return reply.view('./views/index.liquid', {
        jobs: jobs,
        layoutName: format == 'ajax' ? 'layouts/empty' : 'layouts/fullPage',
    });
});

server.post(
    '/job',
    {
        preValidation: function (request, reply) {
            return server.csrfProtection.apply(this, arguments);
        },
    },
    async (request, reply) => {
        let action = request.query.action;
        let jobId = request.query.id;
        let runner = store.getRunner();

        if (action == 'run') {
            await runner.runJob(jobId);
        }
        if (action == 'stop') {
            await runner.stopJob(jobId);
        }
        reply.redirect(302, '/');
    }
);

server.post(
    '/executions',
    {
        preValidation: function (request, reply) {
            return server.csrfProtection.apply(this, arguments);
        },
    },
    async (request, reply) => {
        let action = request.query.action;
        let jobId = request.query.id;

        if (action == 'clear') {
            monitor.clearExecution(jobId);
            reply.redirect(302, '/');
            return;
        }

        reply.send('Invalid action !');
    }
);

server.get('/executions', function (request, reply) {
    let executionId = request.query.id;

    return reply.view('./views/logs.liquid', {
        logs: monitor.getExecutionLogs(executionId),
        executionId: executionId,
    });
});

// Run the server!
const start = async () => {
    try {
        let port = process.env.BREE_DASHBOARD_PORT;

        if (port) {
            await server.listen(port);
        } else {
            // use a random available port
            await server.listen();
        }
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

module.exports = {
    start: start,
};
