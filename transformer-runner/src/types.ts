export type ActorCredentials = {
    slug: string;
    sessionToken: string;
}

export interface Contract {
    id: string;
    data : any;
    name: string;
    slug: string;
    tags: string[];
    type: string;
    links: any;
    active: boolean;
    markers: any[];
    version: string;
    requires: any[];
    linked_at : any;
    created_at: string;
    updated_at: string;
    capabilities: any[];
}

export interface TaskContract extends Contract {
    data : {
        actor: string;
        input: ArtefactContract;
        transformer: TransformerContract;
        workerFilter: any;
    }
}

export interface ArtefactContract extends Contract {
    data: {
        artefact: Artefact;
        should_trigger: boolean;
    }
}

export interface TransformerContract extends Contract {
    data: {
        image : {
            name: string;
        }
        trigger: any;
        requirements: {
            os: string;
            architecture: string;
            workerFilter: any;
        }
    }
    
}

export type Artefact = {
    name: string;
    type: ArtefactType;
}

// Possible artifact type values
export type ArtefactType =
    'image';
