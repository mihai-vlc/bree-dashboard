(function () {
    let state = {
        hasAutoReferesh: false,
        intervalId: null,
        isAllowedToReferesh: true,
    };

    UIkit.util.on('body', 'click', '.js-open-execution-log', function (e) {
        e.preventDefault();
        state.isAllowedToReferesh = false;

        let executionId = e.target.getAttribute('data-execution-id');

        fetch('/executions?id=' + executionId)
            .then((response) => response.text())
            .then((result) => {
                let dialog = UIkit.modal.dialog(result);

                dialog.$el.addEventListener('hide', () => {
                    state.isAllowedToReferesh = true;
                });
            });
    });

    UIkit.util.on('body', 'click', '.js-confirm-form', function (e) {
        e.preventDefault();

        state.isAllowedToReferesh = false;

        UIkit.modal.confirm('Are you sure that you want to clear the logs ?').then(
            function onAccept() {
                if (e.target.form) {
                    e.target.form.submit();
                }
            },
            function onCancel() {
                state.isAllowedToReferesh = true;
            }
        );
    });

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

        startProgressAnimation(intervalSeconds);

        state.intervalId = setTimeout(() => {
            if (!state.isAllowedToReferesh) {
                return;
            }

            fetchUpdatedJobs().then(startAutoReferesh).catch(startAutoReferesh);
        }, intervalSeconds * 1000);

        UIkit.util.$('.js-auto-refresh').checked = true;
    }
    function stopAutoReferesh() {
        stopProgressAnimation();

        state.hasAutoReferesh = false;
        localStorage.removeItem('autoReferesh');
        clearTimeout(state.intervalId);
        UIkit.util.$('.js-auto-refresh').checked = false;
    }

    function fetchUpdatedJobs() {
        return fetch('/?format=ajax')
            .then((response) => response.text())
            .then((result) => {
                UIkit.util.$('.js-content-wrapper').innerHTML = result;
            });
    }

    function startProgressAnimation(duration) {
        let element = document.querySelector('.js-nprogress');

        if (!element.classList.contains('progress-bar-animation')) {
            element.classList.add('progress-bar-animation');
        }

        let animation = element.getAnimations()[0];
        animation.cancel();
        element.style.animationDuration = duration + 's';
        animation.play();
    }
    function stopProgressAnimation() {
        let element = document.querySelector('.js-nprogress');
        let animation = element.getAnimations()[0];
        animation.cancel();
        element.classList.remove('progress-bar-animation');
        element.offsetHeight; // reflow
    }
})();
