const formatInTimeZone = require('date-fns-tz/formatInTimeZone');
const { writeFileSync } = require('fs');
const { join } = require('path');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

readline.question('Migration name: ', (inputName) => {
    inputName = inputName.trim();
    inputName = inputName.replace(/ +/g, '-');

    if (!inputName) {
        console.log('ERROR: Invalid name');
        readline.close();
        return;
    }

    const prefix = formatInTimeZone(new Date(), 'UTC', 'yyyyMMddHHmm');
    const fileName = `${prefix}-${inputName}.sql`;

    writeFileSync(join(__dirname, '..', 'migrations', fileName), '');

    readline.close();
});
