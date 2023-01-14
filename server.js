import fastify from 'fastify';
import fastifyView from '@fastify/view';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import fastifyCSRF from '@fastify/csrf-protection';
import fastifyFormbody from '@fastify/formbody';
import fastifyStatic from '@fastify/static';
import fastifyBasicAuth from '@fastify/basic-auth';

import { Liquid } from 'liquidjs';

import { getJobs, getRunner } from './store.js';
import { clearExecution, getExecutionLogs } from './monitor.js';

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = fastify({ logger: true });

// Generate Liquid Engine
const engine = new Liquid({
    root: join(__dirname, 'views'),
    extname: '.liquid',
});

server.register(fastifyView, {
    engine: {
        liquid: engine,
    },
});

server.register(fastifyFormbody);
server.register(fastifyCookie);
server.register(fastifySession, {
    secret: process.env.BREE_DASHBOARD_SESSION_SECRET || 'BzFQnUEU5utk38y8wUsvQaHdxwxunfRU',
    cookie: {
        secure: 'auto',
    },
});
server.register(fastifyCSRF, {
    sessionPlugin: '@fastify/session',
});

server.register(fastifyBasicAuth, {
    validate: validate,
    authenticate: true,
});

function validate(username, password, req, reply, done) {
    if (
        username === process.env.BREE_DASHBOARD_USERNAME &&
        password === process.env.BREE_DASHBOARD_PASSWORD
    ) {
        done();
    } else {
        done(new Error('Invalid credentials !'));
    }
}

if (process.env.BREE_DASHBOARD_BASIC_AUTH == 'true') {
    server.after(() => {
        server.addHook('onRequest', server.basicAuth);
    });
}

server.register(fastifyStatic, {
    root: join(__dirname, 'public'),
    prefix: '/public/', // optional: default '/'
});

server.get('/', async (request, reply) => {
    let jobs = getJobs();
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
        preValidation: function () {
            return server.csrfProtection.apply(this, arguments);
        },
    },
    async (request, reply) => {
        let action = request.query.action;
        let jobId = request.query.id;
        let runner = getRunner();

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
        preValidation: function () {
            return server.csrfProtection.apply(this, arguments);
        },
    },
    async (request, reply) => {
        let action = request.query.action;
        let jobId = request.query.id;

        if (action == 'clear') {
            clearExecution(jobId);
            reply.redirect(302, '/');
            return;
        }

        reply.send('Invalid action !');
    }
);

server.get('/executions', function (request, reply) {
    let executionId = request.query.id;

    return reply.view('./views/logs.liquid', {
        logs: getExecutionLogs(executionId),
        executionId: executionId,
    });
});

// Run the server!
export const start = async () => {
    try {
        let port = process.env.BREE_DASHBOARD_PORT;
        let host = process.env.BREE_DASHBOARD_HOST || '127.0.0.1';

        if (port) {
            await server.listen({
                port: port,
                host: host,
            });
        } else {
            // use a random available port
            await server.listen({
                host: host,
            });
        }
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
