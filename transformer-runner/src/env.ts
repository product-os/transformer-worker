export default {
	// Old registration process
	workerSlug: process.env.WORKER_SLUG || '',
	workerJfToken: process.env.WORKER_JF_TOKEN || '',
	
	// New registration process
	workerJfUsername: process.env.WORKER_JF_USERNAME,
	workerJfPassword: process.env.WORKER_JF_PASSWORD,
	
	jfApiUrl: process.env.JF_API_URL || '',
	jfApiPrefix: process.env.JF_API_PREFIX || '',
	registryHost: process.env.REGISTRY_HOST || '',
	registryPort: process.env.REGISTRY_PORT,
	standardArtifactType: 'tgz',
	inputDir: 'input',
	outputDir: 'output',
	inputManifestFilename: 'input.json',
	outputManifestFilename: 'output.json',
	contractFilename: 'contract.json',
	artifactDirectoryName: 'artifact',
};
