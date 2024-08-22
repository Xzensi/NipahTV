export abstract class Extension {
	abstract name: string
	abstract version: string
	abstract description: string
	rootContext: RootContext
	sessions: Session[] = []

	constructor(rootContext: RootContext, sessions: Session[]) {
		this.rootContext = rootContext
		this.sessions = sessions
	}

	/**
	 * Called when the extension is enabled
	 */
	abstract onEnable(): void

	/**
	 * Called when the extension is disabled
	 */
	abstract onDisable(): void
}
