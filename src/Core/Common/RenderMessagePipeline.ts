export type RenderMessageMiddleware = (
	message: ChatMessage,
	badgesEl: HTMLElement,
	usernameEl: HTMLElement,
	messageParts: any[],
	next: () => void
) => void

export default class RenderMessagePipeline {
	private middlewares: RenderMessageMiddleware[] = []

	use(middleware: RenderMessageMiddleware) {
		this.middlewares.push(middleware)
		return middleware
	}

	process(message: ChatMessage, badgesEl: HTMLElement, usernameEl: HTMLElement, messageParts: any[]) {
		const stack = [...this.middlewares]

		const execute = () => {
			const nextMiddleware = stack.shift()
			if (nextMiddleware) {
				nextMiddleware(message, badgesEl, usernameEl, messageParts, execute)
			}
		}

		execute()
	}

	remove(middleware: RenderMessageMiddleware) {
		const index = this.middlewares.indexOf(middleware)
		if (index !== -1) {
			this.middlewares.splice(index, 1)
		}
	}

	clear() {
		this.middlewares = []
	}
}
