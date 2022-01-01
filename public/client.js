(function () {
    let state = {};

    UIkit.util.on('body', 'click', '.js-open-execution-log', function (e) {
        e.preventDefault();
        let initialAutoReferesh = state.hasAutoReferesh;

        if (state.hasAutoReferesh) {
            stopAutoReferesh();
        }

        let executionId = e.target.getAttribute('data-execution-id');

        fetch('/executions?id=' + executionId)
            .then((response) => response.text())
            .then((result) => {
                let dialog = UIkit.modal.dialog(result);

                dialog.$el.addEventListener('hide', () => {
                    if (initialAutoReferesh) {
                        startAutoReferesh();
                    }
                });
            });
    });

    state.intervalId = null;
    state.hasAutoReferesh = !!localStorage.getItem('autoReferesh');

    if (state.hasAutoReferesh) {
        UIkit.util.$('.js-auto-refresh').checked = true;
        UIkit.util.$('.js-referesh-interval').value = localStorage.getItem('autoReferesh');
        startAutoReferesh();
    }

    UIkit.util.on('.js-auto-refresh', 'change', function () {
        if (this.checked) {
            startAutoReferesh();
        } else {
            stopAutoReferesh();
        }
    });

    UIkit.util.on('.js-referesh-interval', 'change', function () {
        stopAutoReferesh();
        startAutoReferesh();
    });

    function startAutoReferesh() {
        state.hasAutoReferesh = true;
        let intervalSeconds = UIkit.util.$('.js-referesh-interval').value || 30;
        localStorage.setItem('autoReferesh', intervalSeconds);
        state.intervalId = setInterval(() => {
            fetchUpdatedJobs();
        }, intervalSeconds * 1000);
        UIkit.util.$('.js-auto-refresh').checked = true;
    }
    function stopAutoReferesh() {
        state.hasAutoReferesh = false;
        localStorage.removeItem('autoReferesh');
        clearTimeout(state.intervalId);
        UIkit.util.$('.js-auto-refresh').checked = false;
    }

    function fetchUpdatedJobs() {
        fetch('/?format=ajax')
            .then((response) => response.text())
            .then((result) => {
                UIkit.util.$('.js-content-wrapper').innerHTML = result;
            });
    }
})();
