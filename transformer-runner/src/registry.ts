import * as Docker from 'dockerode';
import * as spawn from '@ahmadnassri/spawn-promise';
import * as fs from 'fs';
import { streamToPromise } from "./util";

const isLocalRegistry = (registryUri: string) => !registryUri.includes('.') || registryUri.includes(".local");

export interface RegistryAuthOptions {
	username: string;
	password: string;
}

export default class Registry {
	public readonly registryUrl: string;
	public readonly docker: Docker;

	constructor(registryHost: string, registryPort?: string) {
		this.registryUrl = registryPort
			? `${registryHost}:${registryPort}`
			: registryHost;
		this.docker = new Docker();
	}
	
	public async pullImage(
		imageReference: string,
		authOpts: RegistryAuthOptions,
	) {
		const imageRef = `${this.registryUrl}/${imageReference}`;
		console.log(`[WORKER] Pulling image ${imageRef}`);
		const authconfig = this.getDockerAuthConfig(authOpts);
		const progressStream = await this.docker.pull(imageRef, { authconfig });
		await this.followDockerProgress(progressStream);
		return imageRef;
	}

	public async pushImage(imageReference: string, imagePath: string, authOpts: RegistryAuthOptions) {
		console.log(`[WORKER] Pushing image ${imageReference}`);
		const image = await this.loadImage(imagePath);
		await image.tag({ repo: imageReference, force: true });
		const authconfig = this.getDockerAuthConfig(authOpts);
		const progressStream = await image.push({ registry: this.registryUrl, authconfig });
		await this.followDockerProgress(progressStream);
	}

	private getDockerAuthConfig(authOpts: RegistryAuthOptions) {
		return {
			username: authOpts.username,
			password: authOpts.password,
			serveraddress: this.registryUrl,
		}
	}

	private async followDockerProgress (progressStream: NodeJS.ReadableStream){
		return new Promise((resolve, reject) =>
			this.docker.modem.followProgress(progressStream, (err:Error) => err ? reject(err) : resolve())
		);
	}
	

	public async pullArtifact(artifactReference: string, destDir: string, opts: RegistryAuthOptions) {
		console.log(`[WORKER] Pulling artifact ${artifactReference}`);
		try {
			const output = await this.runOrasCommand([
				`pull`,
				`${this.registryUrl}/${artifactReference}`,
			], opts, { cwd: destDir });

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

	public async pushArtifact(artifactReference: string, artifactPath: string, opts: RegistryAuthOptions) {
		console.log(`[WORKER] Pushing artifact ${artifactReference}`);
		try {
			const artifacts = await fs.promises.readdir(artifactPath);
			const orasCmd = [
				`push`,
				`${this.registryUrl}/${artifactReference}`,
				...artifacts
			];
			await this.runOrasCommand(orasCmd, opts, { cwd: artifactPath });
		} catch (e) {
			this.logErrorAndThrow(e);
		}
	}

	private async runOrasCommand(args: string[], opts: RegistryAuthOptions, spawnOptions: any = {}) {
		if (isLocalRegistry(this.registryUrl)) {
			// this is a local name. therefore we allow http
			args.push('--plain-http');
		} 
		if (opts.user) {
			args.push('--username');
			args.push(opts.username);
			args.push('--password');
			args.push(opts.password);
		}
		console.log(`Oras command: \n${args.concat(' ')}`);
		const streams = await spawn(`oras`, args, spawnOptions);
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
	
	private async loadImage(imageFilePath: string)  {
		const loadImageStream = await this.docker.loadImage(fs.createReadStream(imageFilePath));
		const loadResult = await streamToPromise(loadImageStream);

		// docker.load example output:
		// Loaded image: myApp/myImage
		// Loaded image ID: sha256:1247839245789327489102473
		const successfulLoadRegex = /Loaded image.*?: (\S+)\\n/i;
		const loadResultMatch = successfulLoadRegex.exec(loadResult);
		if (!loadResultMatch) {
			throw new Error(`Failed to load image : ${imageFilePath} .  ${loadResult}`);
		}
		const image = this.docker.getImage(loadResultMatch[1]);

		return image;
	}
}
