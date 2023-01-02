const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

readline.question('Migration name: ', (inputName) => {
    inputName = inputName.trim();
    inputName = inputName.replace(/[^a-zA-Z0-9]+/g, '-');

    if (!inputName) {
        console.log('ERROR: Invalid name');
        readline.close();
        return;
    }

    require('../migrations').create(inputName + '.sql');

    readline.close();
});
