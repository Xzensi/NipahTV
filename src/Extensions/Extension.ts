export abstract class Extension {
	abstract name: string
	abstract version: string
	abstract description: string

	constructor(protected rootContext: RootContext, protected sessions: Session[]) {}

	/**
	 * Called when the extension is enabled
	 */
	abstract onEnable(): void

	/**
	 * Called when the extension is disabled
	 */
	abstract onDisable(): void
}
