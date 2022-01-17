import { logger } from './logger';
import { initializeRunner } from './runner';

initializeRunner().catch((e) => {
	logger.error(e, 'RUNNER ERROR');
	process.exit(1);
});
