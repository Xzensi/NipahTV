export type Middleware<K> = (data: K, next: () => void) => void

export default class Pipeline<K> {
	private middlewares: Middleware<K>[] = []

	use(middleware: Middleware<K>) {
		this.middlewares.push(middleware)
		return middleware
	}

	process(data: K) {
		const stack = [...this.middlewares]

		const execute = () => {
			const nextMiddleware = stack.shift()
			if (nextMiddleware) {
				nextMiddleware(data, execute)
			}
		}

		execute()
	}

	remove(middleware: Middleware<K>) {
		const index = this.middlewares.indexOf(middleware)
		if (index !== -1) {
			this.middlewares.splice(index, 1)
		}
	}

	clear() {
		this.middlewares = []
	}
}
