import type { OutputManifest, TaskContract } from './types';
import * as fs from 'fs';
import * as path from 'path';

export async function validateTask(task: TaskContract) {
	// this could be simplified with e.g. https://github.com/PicnicSupermarket/aegis
	const message = 'Task validation error: ';
	if (!task?.id || task?.id === '') {
		throw new Error(`${message} missing id`);
	}

	if (!task?.data?.actor) {
		throw new Error(`${message} missing actor property`);
	}

	if (!task?.data?.input?.id) {
		throw new Error(`${message} missing input contract`);
	}

	if (
		!task?.data?.transformer?.id ||
		task?.data?.transformer?.type?.startsWith('transformer@')
	) {
		throw new Error(`${message} missing transformer`);
	}
}

export async function validateOutputManifest(
	m: OutputManifest,
	outputDir: string,
) {
	const message = 'Output manifest validation error: ';
	if (!Array.isArray(m.results)) {
		throw new Error(`${message} missing results array`);
	}

	if (m.results.length < 1) {
		console.log(`[WORKER] INFO: empty results array`);
	}

	for (const result of m.results) {
		if (!result.contract || !result.contract.data) {
			throw new Error(`${message} missing result contract`);
		}

		// Note: artifactPath can be empty
		if (result.artifactPath) {
			try {
				await fs.promises.access(
					path.join(outputDir, result.artifactPath),
					fs.constants.R_OK,
				);
			} catch (e) {
				throw new Error(
					`${message} artifact path ${result.artifactPath} is not readable`,
				);
			}
		}
	}
}
