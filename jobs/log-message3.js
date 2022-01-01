var logger = require('../logger');

logger.error('Something happned');

setTimeout(() => {
    logger.info('Finished');
}, 15000);
