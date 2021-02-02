import type { OutputManifest, TaskContract } from './types';
import * as fs from 'fs';
import * as path from 'path';

export async function validateTask(task: TaskContract) {
	const message = 'Task validation error: ';
	if (!task?.id || task?.id === '') {
		throw new Error(`${message} missing id`);
	}

	if (!task?.data) {
		throw new Error(`${message} missing data property`);
	}

	if (!task?.data?.actor || task?.id === '') {
		throw new Error(`${message} missing actor property`);
	}

	if (!task?.data?.input) {
		throw new Error(`${message} missing input contract`);
	}

	if (!task?.data?.transformer) {
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

	// shouldn't this be valid? no results == stop endless loop?
	if (m.results.length < 1) {
		throw new Error(`${message} empty results array`);
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
