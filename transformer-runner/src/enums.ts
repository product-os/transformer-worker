export enum TaskStatus {
	Pending = 'pending',
	Accepted = 'accepted',
	Completed = 'completed',
	Failed = 'failed',
}

export enum LinkNames {
	WasTransformedTo = 'was transformed to',
	Generated = 'generated',
	Ran = 'ran',
	RepoContains = 'contains',
}

export enum LinkNamesInverse {
	WasTransformedFrom = 'was transformed from',
	WasGeneratedBy = 'was generated by',
	WasRunBy = 'was run by',
}
