import * as monitor from './monitor.js';

var state = {};

function getStatus(job) {
    let name = job.name;
    let bree = state.bree;
    let status = 'done';
    let icon = 'check';

    if (bree.workers.get(name)) {
        status = 'active';
        icon = 'refresh';
    } else if (bree.timeouts.get(name)) {
        status = 'delayed';
        icon = 'future';
    } else if (bree.intervals.get(name)) {
        status = 'waiting';
        icon = 'clock';
    }
    return {
        label: status,
        id: status,
        icon: icon,
    };
}

export function init(bree) {
    state.bree = bree;
}
export function getRunner() {
    return {
        runJob: async (id) => state.bree.run(id),
        stopJob: async (id) => state.bree.stop(id),
    };
}
export function getJobs() {
    return state.bree.config.jobs.map(function (job) {
        const executions = monitor.getExecutions(job.name);

        return {
            name: job.name,
            status: getStatus(job),
            interval: job.interval,
            path: job.path,
            topExecutions: executions.slice(0, 3),
            otherExecutions: executions.slice(3),
        };
    });
}
