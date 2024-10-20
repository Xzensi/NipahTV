export interface CommandEntry {
	name: string
	alias?: string
	params?: string
	minAllowedRole?: 'broadcaster' | 'moderator'
	description: string
	argValidators?: Record<string, (arg: string) => string | null>
	execute?: (deps: RootContext & Session, args: Array<string | number>) => Promise<string | void>
	api?:
		| {
				protocol: 'http'
				method: 'post' | 'put' | 'delete'
				uri: (channelName: string, args: Array<string | number>) => string
				data?: (args: Array<string | number>) => Record<string, string | number | boolean>
				errorMessage: string
				successMessage?: string
		  }
		| {
				protocol: 'ws'
				event: string
		  }
}
