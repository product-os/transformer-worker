import { initializeRunner } from './runner';

initializeRunner().catch((e) => {
	console.log('RUNNER ERROR', e);
	process.exit(1);
});
