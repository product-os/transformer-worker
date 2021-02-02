export type ActorCredentials = {
	slug: string;
	sessionToken: string;
};

export interface Contract {
	id?: string;
	data?: any;
	name?: string;
	slug: string;
	tags?: string[];
	type: string;
	links?: any;
	active?: boolean;
	markers?: any[];
	version: string;
	linked_at?: any;
	created_at?: string;
	updated_at?: string;
	requires?: any[];
	provides?: any[];
}

export interface TaskContract extends Contract {
	data: {
		actor: string;
		input: ArtifactContract;
		transformer: TransformerContract;
	};
}

export interface ArtifactContract extends Contract {
	data: {
		artifactReady: boolean;
	};
}

export interface TransformerContract extends Contract {
	data: {
		image: {
			name: string;
		};
		trigger: any;
		requirements: {
			os: string;
			architecture: string;
		};
	};
}

export type Artifact = {
	name: string;
	type: string;
	// NOTE: Artifacts are transported in a single format (e.g. targz)
};

export type InputManifest = {
	input: {
		contract: ArtifactContract;
		artifactPath: string;
	};
};

export type OutputManifest = {
	results: [
		{
			contract: ArtifactContract;
			artifactPath: string;
		},
	];
};
