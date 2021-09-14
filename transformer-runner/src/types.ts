import { ContractData } from "@balena/jellyfish-types/build/core";
import { Contract } from "@balena/jellyfish-types/build/core";

export interface ActorCredentials {
	slug: string;
	sessionToken: string;
};

interface TaskData extends ContractData {
	actor: string;
	input: ArtifactContract;
	transformer: TransformerContract;
}

export interface TaskContract extends Contract<TaskData> {};

interface ArtifactData extends ContractData {
	$transformer?: {
		artifactReady: boolean;
		baseSlug?: string;
		slugSuffix?: string; // used to allow transformers customization of generated slugs. needed when creating multiple instances of same type
		encryptedSecrets?: any;
		backflow?: Record<string, Contract<any>>;
	};
}
export interface ArtifactContract extends Contract<ArtifactData> {}

interface TransformerData extends ContractData {
	inputFilter: any;
	inputType?: 'contract-only' | 'full';
	requirements?: {
		os?: string;
		architecture?: string;
	};
	backflowMapping: [BackflowMapping];
	encryptedSecrets?: any;
}

export interface TransformerContract extends Contract<TransformerData> {}

export interface BackflowMapping {
	downstreamValue?:  Formula | any;
	upstreamPath: Formula | string;
}

export interface Formula {
	$$formula: string;
}
	
interface LinkData extends ContractData {
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
export interface LinkContract extends Contract<LinkData> {}

export type InputManifest = {
	input: {
		contract: ArtifactContract;
		transformerContract: TransformerContract;
		artifactPath: string;
		decryptedSecrets?: any;
		decryptedTransformerSecrets?: any;
	};
};

export type OutputManifest = {
	results: [
		{
			contract: ArtifactContract;
			artifactPath?: string;
			imagePath?: string;
			manifestList?: Array<string>;
		},
	];
};

export type TaskStatusMetadata = {
	timestamp?: number;
	duration?: number;
	message?: string;
}
