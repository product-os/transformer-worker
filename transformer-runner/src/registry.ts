import Docker from 'dockerode';
import * as spawn from '@ahmadnassri/spawn-promise';
import * as fs from 'fs';
import { streamToPromise } from './util';
import fetch from 'isomorphic-fetch';
import { mimeType } from './consts';
import * as stream from 'stream';
import { promisify } from 'util';
import path = require('path');
import { logger } from './logger';
const pump = promisify(stream.pipeline); // Node 16 gives native pipeline promise... This is needed to properly handle stream errors

const isLocalRegistry = (registryUri: string) =>
	!registryUri.includes('.') || registryUri.includes('.local');

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
		const imageRef = imageReference;
		logger.info({ imageRef }, 'pulling image');
		const authconfig = this.getDockerAuthConfig(authOpts);
		const progressStream = await this.docker.pull(imageRef, { authconfig });
		await this.followDockerProgress(progressStream);
		return imageRef;
	}

	public async pushImage(
		imageReference: string,
		imagePath: string,
		authOpts: RegistryAuthOptions,
	) {
		logger.info({ imageReference }, 'pushing image');
		const image = await this.loadImage(imagePath);
		const { registry, repo, tag } =
			/^(?<registry>[^/]+)\/(?<repo>.*):(?<tag>[^:]+)$/.exec(imageReference)
				?.groups!;
		await image.tag({ repo: `${registry}/${repo}`, tag, force: true });
		const taggedImage = await this.docker.getImage(imageReference);
		const authconfig = this.getDockerAuthConfig(authOpts);
		const pushOpts = { registry, authconfig };
		logger.info({ image: taggedImage.id }, 'pushing image');
		const progressStream = await taggedImage.push(pushOpts);
		await this.followDockerProgress(progressStream);
	}

	private getDockerAuthConfig(authOpts: RegistryAuthOptions) {
		return {
			username: authOpts.username,
			password: authOpts.password,
			serveraddress: this.registryUrl,
		};
	}

	private async followDockerProgress(progressStream: NodeJS.ReadableStream) {
		return new Promise((resolve, reject) =>
			this.docker.modem.followProgress(
				progressStream,
				(err: Error | null) => (err ? reject(err) : resolve(null)),
				(line: any) => {
					if (line.progress || line.progressDetail) {
						// Progress bar's just spam the logs
						return;
					}
					logger.info({ line }, 'docker');
					if (line.error) {
						// For some reason not all errors appear in the error callback above
						reject(line);
					}
				},
			),
		);
	}

	public async pullArtifact(
		artifactReference: string,
		destDir: string,
		opts: RegistryAuthOptions,
	) {
		logger.info({ artifactReference }, 'pulling artifact');
		await fs.promises.mkdir(destDir, { recursive: true });
		try {
			const imageType = await this.getImageType(artifactReference, opts);
			// Check if the artifact is an image or a file (oras or docker)
			switch (imageType) {
				case mimeType.dockerManifest:
					// Pull image
					await this.pullImage(artifactReference, {
						username: opts.username,
						password: opts.password,
					});
					// Save to tar
					const destinationStream = fs.createWriteStream(
						path.join(destDir, 'artifact.tar'),
					);
					const imageStream = await this.docker
						.getImage(artifactReference)
						.get();
					await pump(imageStream, destinationStream);
					logger.info({ destDir }, 'wrote docker image');
					break;

				case mimeType.ociManifest:
					// Pull artifact
					const output = await this.runOrasCommand(
						['pull', artifactReference],
						opts,
						{ cwd: destDir },
					);

					const m = output.match(/Downloaded .* (.*)/);
					if (m[1]) {
						return m[1];
					} else {
						throw new Error(
							'[ERROR] Could not determine what was pulled from the registry',
						);
					}

				default:
					throw new Error(
						'unknown media type found for artifact ' +
							artifactReference +
							' : ' +
							imageType,
					);
			}
		} catch (e) {
			this.logErrorAndThrow(e);
		}
	}

	public async pushArtifact(
		artifactReference: string,
		artifactPath: string,
		opts: RegistryAuthOptions,
	) {
		logger.info({ artifactReference }, 'pushing artifact');
		try {
			const artifacts = await fs.promises.readdir(artifactPath);
			const orasCmd = ['push', artifactReference, ...artifacts];
			await this.runOrasCommand(orasCmd, opts, { cwd: artifactPath });
		} catch (e) {
			this.logErrorAndThrow(e);
		}
	}

	parseWwwAuthenticate = (wwwAuthenticate: any) => {
		return {
			realm: (/realm="([^"]+)/.exec(wwwAuthenticate) || [])[1],
			service: (/service="([^"]+)/.exec(wwwAuthenticate) || [])[1],
			scope: (/scope="([^"]+)/.exec(wwwAuthenticate) || [])[1],
		};
	};

	public async pushManifestList(
		artifactReference: string,
		manifestList: string[],
		authOptions: RegistryAuthOptions,
	) {
		const localRegistry = isLocalRegistry(this.registryUrl);
		const insecureOpts = localRegistry ? ['--insecure'] : [];
		const fqManifestList = manifestList.map(
			(img) => `${this.registryUrl}/${img}`,
		);

		let fqArtifactReference = artifactReference;
		if (localRegistry) {
			const [host, urlPath] = artifactReference.split('/', 2);
			fqArtifactReference = `${host}:80/${urlPath}`;
		}

		logger.info({ fqArtifactReference }, 'creating manifest list');
		await this.runDockerCliCommand(
			[
				'manifest',
				'create',
				...insecureOpts,
				fqArtifactReference,
				...fqManifestList,
			],
			authOptions,
		);

		logger.info({ fqArtifactReference }, 'pushing manifest list');
		await this.runDockerCliCommand(
			['manifest', 'push', ...insecureOpts, fqArtifactReference],
			authOptions,
		);
	}

	// login cache to prevent unnecessary logins for the same user
	dockerLogins = new Set<string>();

	private async runDockerCliCommand(
		dockerArgs: string[],
		opts: RegistryAuthOptions,
		dockerSpawnOptions: any = {},
	) {
		logger.info({ dockerArgs }, 'running docker-CLI command');
		const run = async (args: string[], spawnOptions: any = {}) => {
			const streams = await spawn('docker', args, spawnOptions);
			const stdout = streams.stdout.toString('utf8');
			const stderr = streams.stderr.toString('utf8');
			return { stdout, stderr };
		};
		if (!this.dockerLogins.has(opts.username)) {
			const loginCmd = [
				'login',
				'--username',
				opts.username,
				'--password',
				opts.password,
				this.registryUrl,
			];
			this.dockerLogins.add(opts.username);
			const { stdout, stderr } = await run(loginCmd, dockerSpawnOptions);
			logger.info({ stdout, stderr }, 'docker login');
		}
		return await run(dockerArgs, dockerSpawnOptions);
	}

	private async runOrasCommand(
		args: string[],
		opts: RegistryAuthOptions,
		spawnOptions: any = {},
	) {
		if (isLocalRegistry(this.registryUrl)) {
			// this is a local name. therefore we allow http
			args.push('--plain-http');
		}
		logger.info({ args }, 'running oras command');
		if (opts.username) {
			args.push('--username');
			args.push(opts.username);
			args.push('--password');
			args.push(opts.password);
		}
		const streams = await spawn('oras', args, spawnOptions);
		const output = streams.stdout.toString('utf8');
		logger.info({ output }, 'oras finished');
		return output;
	}

	private logErrorAndThrow = (e: any) => {
		if (e.spawnargs) {
			logger.error(
				{ args: e.spawnargs, stderr: e.stderr.toString('utf8') },
				'error',
			);
		} else {
			logger.error(e, 'error');
		}
		throw e;
	};

	private async loadImage(imageFilePath: string) {
		const loadImageStream = await this.docker.loadImage(
			fs.createReadStream(imageFilePath),
		);
		const loadResult = await streamToPromise(loadImageStream);

		// docker.load example output:
		// Loaded image: myApp/myImage
		// Loaded image ID: sha256:1247839245789327489102473
		const successfulLoadRegex = /Loaded image.*?: (\S+)\\n/i;
		const loadResultMatch = successfulLoadRegex.exec(loadResult);
		if (!loadResultMatch) {
			throw new Error(
				`failed to load image : ${imageFilePath} .  ${loadResult}`,
			);
		}
		const image = this.docker.getImage(loadResultMatch[1]);

		return image;
	}

	async getImageType(
		artifactReference: string,
		opts: RegistryAuthOptions,
	): Promise<string | null> {
		logger.info({ artifactReference }, 'getting image type for');
		const p1 = artifactReference.split(this.registryUrl)[1]; // /image:tag
		const image = p1.split(':')[0].split('/')[1]; // image
		const tag = p1.split(':')[1];
		const manifestURL = `https://${this.registryUrl}/v2/${image}/manifests/${tag}`;

		const deniedRegistryResp = await fetch(manifestURL);
		const wwwAuthenticate = deniedRegistryResp.headers.get('www-authenticate');
		if (deniedRegistryResp.status !== 401 || !wwwAuthenticate) {
			throw new Error(
				`registry didn't ask for authentication (status code ${deniedRegistryResp.status})`,
			);
		}
		const { realm, service, scope } =
			this.parseWwwAuthenticate(wwwAuthenticate);
		const authUrl = new URL(realm);
		authUrl.searchParams.set('service', service);
		authUrl.searchParams.set('scope', scope);

		logger.info('got wwwAuthenticate for getting access token');

		// login with session user
		const loginResp = await fetch(authUrl.href, {
			headers: {
				Authorization:
					'Basic ' +
					Buffer.from(opts.username + ':' + opts.password).toString('base64'), // basic auth
			},
		});

		const loginBody = await loginResp.json();
		if (!loginBody.token) {
			throw new Error(
				`couldn't log in for registry (status code ${loginResp.status})`,
			);
		}
		logger.info('got access token, fetching manifest for image');

		// get source manifest
		const srcManifestResp = await fetch(manifestURL, {
			headers: {
				Authorization: `Bearer ${loginBody.token}`,
				Accept: Object.values(mimeType).join(','),
			},
		});

		return srcManifestResp.headers.get('content-type');
	}
}
