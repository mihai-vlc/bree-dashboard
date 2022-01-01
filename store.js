var state = {};

function getStatus(job) {
    let name = job.name;
    let bree = state.bree;
    let status = 'done';
    let icon = 'check';

    if (bree.workers[name]) {
        status = 'active';
        icon = 'refresh';
    } else if (bree.timeouts[name]) {
        status = 'delayed';
        icon = 'future';
    } else if (bree.intervals[name]) {
        status = 'waiting';
        icon = 'clock';
    }
    return {
        label: status,
        id: status,
        icon: icon,
    };
}

module.exports = {
    init(bree) {
        state.bree = bree;
    },

    getRunner() {
        return {
            runJob: (id) => state.bree.run(id),
            stopJob: (id) => state.bree.stop(id),
        };
    },

    getJobs() {
        let monitor = require('./monitor');

        return state.bree.config.jobs.map(function (job) {
            let executions = monitor.getExecutions(job.name);

            return {
                name: job.name,
                status: getStatus(job),
                interval: job.interval,
                path: job.path,
                topExecutions: executions.slice(0, 3),
                otherExecutions: executions.slice(3),
            };
        });
    },
};
