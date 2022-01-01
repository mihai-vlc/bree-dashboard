const server = require('fastify')({ logger: false });
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

server.get('/', (request, response) => {
    let jobs = store.getJobs();
    response.view('./views/index.liquid', {
        jobs: jobs,
    });
});

server.get('/job', (request, reply) => {
    let action = request.query.action;
    let jobId = request.query.id;
    let runner = store.getRunner();

    if (action == 'run') {
        runner.runJob(jobId);
    }
    if (action == 'stop') {
        runner.stopJob(jobId);
    }
    reply.redirect(302, '/');
});

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
