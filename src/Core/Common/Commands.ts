export interface CommandEntry {
	name: string
	alias?: string
	params?: string
	minAllowedRole?: 'broadcaster' | 'moderator'
	description: string
	argValidators?: Record<string, (arg: string) => string | null>
	execute?: (deps: RootContext & Session, args: string[]) => Promise<string | void>
	api?:
		| {
				protocol: 'http'
				method: 'post' | 'put' | 'delete'
				uri: (channelName: string, args: string[]) => string
				data?: (args: string[]) => Record<string, string | number | boolean>
				errorMessage: string
				successMessage?: string
		  }
		| {
				protocol: 'ws'
				event: string
		  }
}
