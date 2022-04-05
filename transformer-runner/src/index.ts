import { logger } from './logger';
import { initializeRunner } from './runner';

initializeRunner().catch((e) => {
	logger.error(e, 'RUNNER ERROR');
	process.exit(1);
});

process.on('exit', function (code) {
	logger.info(`Exiting with code ${code}`);
});

// catch ctrl+c event and exit normally
process.on('SIGINT', function () {
	logger.info('Ctrl-C...');
	process.exit(2);
});

// catch uncaught exceptions, trace, then exit normally
process.on('uncaughtException', function (e) {
	logger.info('Uncaught Exception...');
	logger.info(e.stack);
	process.exit(99);
});
