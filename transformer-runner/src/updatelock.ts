import * as lockFile from 'lockfile';
import * as util from 'util';

const lock = util.promisify(lockFile.lock)
const unlock = util.promisify(lockFile.unlock)
const updateLockFile = '/tmp/balena/updates.lock';

let locks = 0

/**
 * locker counts the number of active tasks and ensure that
 * while tasks are being processed, Balena doesn't update our service
 * and thus would interrupt the current task.
 */
export const locker = {
	addActive: async ()=> {
		if (locks == 0) {
			await lock(updateLockFile)
		}
		locks++;
	},
	removeActive: async ()=> {
		locks--;
		if (locks <= 0) {
			await unlock(updateLockFile)
		}
	}
}
