const server = require('fastify')({ logger: true });
const POV = require('point-of-view');
let { Liquid } = require('liquidjs');
let path = require('path');

let store = require('./store');

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

server.get('/', async (request, reply) => {
    let jobs = store.getJobs();
    const csrfToken = await reply.generateCsrf();

    return reply.view('./views/index.liquid', {
        jobs: jobs,
        csrfToken: csrfToken,
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

// Run the server!
const start = async () => {
    try {
        await server.listen(3000);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

module.exports = {
    start: start,
};
