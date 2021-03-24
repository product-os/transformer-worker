export interface ActorCredentials {
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
		$transformer: {
			artifactReady: boolean;
			baseSlug: string;
			encryptedSecrets?: any;
		}
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
		backflowMapping: [BackflowMapping];
	};
}

export interface BackflowMapping {
	downstreamValue?:  Formula | any;
	upstreamPath: Formula | string;
}

export interface Formula {
	$$formula: string;
}


export interface LinkContract extends Contract {
	data: {
		from: {
			id: string;
			type: string;
		}
		inverseName: string;
		to: {
			id: string;
			type: string;
		}
	}
}

export type InputManifest = {
	input: {
		contract: ArtifactContract;
		artifactPath: string;
		decryptedSecrets?: any;
	};
};

export type OutputManifest = {
	results: [
		{
			contract: ArtifactContract;
			artifactPath: string;		// Expected to be a directory
			imagePath: string;
		},
	];
};

export type TaskStatusMetadata = {
	timestamp?: number;
	duration?: number;
	message?: string;
}
