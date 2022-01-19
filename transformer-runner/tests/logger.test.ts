import { logger, withLogger } from '../src/logger';

describe('logger context', () => {
	test('works with nested contexts', async () => {
		const exp = 42;
		logger.info('here we go');
		const childLogger = logger.child({ sub: 1 });
		const act = await withLogger(childLogger, async () => {
			logger.info("I'm in here");
			return Promise.resolve(exp);
		});

		expect(act).toStrictEqual(exp);
	});
});
