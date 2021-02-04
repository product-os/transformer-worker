import * as Docker from 'dockerode';
import type { ActorCredentials, ArtifactContract } from './types';
import * as spawn from '@ahmadnassri/spawn-promise';
import * as fs from 'fs';

const isLocalRegistry = (registryUri: string) => !registryUri.includes('.');

export default class Registry {
	public readonly registryUrl: string;
	public readonly docker: Docker;

	constructor(registryHost: string, registryPort?: string) {
		this.registryUrl = registryPort
			? `${registryHost}:${registryPort}`
			: registryHost;
		this.docker = new Docker();
	}

	public async pullTransformerImage(
		transformerImageReference: string,
		actorCredentials: ActorCredentials,
	) {
		const transformerImageRef = `${this.registryUrl}/${transformerImageReference}`;
		console.log(`[WORKER] Pulling transformer ${transformerImageRef}`);

		const auth = {
			username: actorCredentials.slug,
			password: actorCredentials.sessionToken,
			serveraddress: this.registryUrl,
		};

		await new Promise((resolve, reject) => {
			this.docker.pull(
				transformerImageRef,
				{ authconfig: auth },
				(err: Error, stream: any) => {
					if (err) {
						console.error(err);
						return reject(false);
					}
					this.docker.modem.followProgress(stream, onFinished, onProgress);

					function onFinished(_err: Error, _output: any) {
						return resolve(true);
					}

					function onProgress(event: any) {
						console.log(event.status);
						if (event.hasOwnProperty('progress')) {
							console.log(event.progress);
						}
					}
				},
			);
		});

		return transformerImageRef;
	}

	public async pullArtifact(contract: ArtifactContract, destDir: string) {
		console.log(`[WORKER] Pulling artifact ${contract.slug}`);
		await fs.promises.mkdir(destDir, { recursive: true });
		try {
			const output = await this.runOrasCommand( [
				`pull`,
				`${this.registryUrl}/${contract.slug}:${contract.version}`,
			], { cwd: destDir });

			const m = output.match(/Downloaded .* (.*)/);
			if (m[1]) {
				return m[1];
			} else {
				throw new Error(
					'[ERROR] Could not determine what was pulled from the registry',
				);
			}
		} catch (e) {
			this.logErrorAndThrow(e);
		}
	}

	public async pushArtifact(contract: ArtifactContract, artifactPath: string) {
		console.log(`[WORKER] Pushing artifact ${contract.slug}`);
		try {
			const artifacts = await  fs.promises.readdir(artifactPath);
			const orasCmd = [
				`push`,
				`${this.registryUrl}/${contract.slug}:${contract.version}`,
				...artifacts
			];
			await this.runOrasCommand(orasCmd, { cwd: artifactPath });
		} catch (e) {
			this.logErrorAndThrow(e);
		}
	}
	
	private async runOrasCommand(args: string[], options: any = {}) {
		if (isLocalRegistry(this.registryUrl)) {
			// this is a local name. therefore we allow http
			args.push('--plain-http');
		}
		console.log(`Oras command: \n${args.concat(' ')}`);
		const streams = await spawn(`oras`, args, options);
		const output = streams.stdout.toString('utf8');
		console.log(`Oras output: ${output}`);
		return output;
	}

	private logErrorAndThrow = (e: any) => {
		if (e.spawnargs) {
			console.error(e.spawnargs);
			console.error(e.stderr.toString('utf8'));
		} else {
			console.error(e);
		}
		throw e;
	};
}
