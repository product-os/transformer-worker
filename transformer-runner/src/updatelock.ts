import * as lockFile from 'lockfile';
import * as fs from 'fs';
import * as util from 'util';

const lock = util.promisify(lockFile.lock);
const unlock = util.promisify(lockFile.unlock);
const updateLockFile = '/tmp/balena/updates.lock';

// due to async/await it can happen that both actions run at the same time
// this prevents modifying the locks counter during the file I/O
let lockReady = Promise.resolve();
let locks = 0;

/**
 * locker counts the number of active tasks and ensure that
 * while tasks are being processed, Balena doesn't update our service
 * and thus would interrupt the current task.
 */
export const locker = {
	// this is necessary to cleanup after a restart of the container
	// e.g. during live-push
	init: async () => {
		await fs.promises.rm(updateLockFile, { force: true, maxRetries: 1 });
	},
	addActive: async () => {
		await lockReady;
		locks++;
		if (locks === 1) {
			lockReady = lock(updateLockFile);
			await lockReady;
		}
	},
	removeActive: async () => {
		await lockReady;
		locks--;
		if (locks === 0) {
			lockReady = unlock(updateLockFile);
			await lockReady;
		}
	},
};
