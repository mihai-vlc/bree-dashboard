UIkit.util.on('.js-open-execution-log', 'click', function (e) {
    e.preventDefault();

    let executionId = e.target.getAttribute('data-execution-id');

    fetch('/executions?id=' + executionId)
        .then((response) => response.text())
        .then((result) => {
            UIkit.modal.dialog(result);
        });
});
