import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';

export async function getSdk(_apiConfig: any) {
	return sdk;
}

const sdk = {
	auth: {
		whoami: async () => {
			return {
				id: '1111-1111-1111-1111',
				slug: process.env.WORKER_SLUG || 'worker-1111-1111-1111-1111',
			};
		},
	},
	card: {
		create: (_data: any) => {
			return {
				id: '1234-1234-1234-1234',
				slug: 'card-1234-1234-1234-1234',
			};
		},
		get: (_id: string) => {
			return {
				id: '1234-1234-1234-1234',
				slug: 'card-1234-1234-1234-1234',
			};
		},
		update: (_id: string, _type: string, _data: any) => {},
	},
	setAuthToken: async (_authToken: string) => {},
	stream: async (_schema: any) => {
		const interval = 15000;

		let task = '';
		try {
			task = JSON.parse(
				await fs.promises.readFile(
					path.join(process.cwd(), 'mocks', 'task.json'),
					'utf8',
				),
			);
		} catch (e) {
			console.log(e);
		}

		const taskEmitter = new EventEmitter();
		setInterval(() => {
			taskEmitter.emit('update', task);
		}, interval);

		return taskEmitter;
	},
};
