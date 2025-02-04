import { FeedEntry } from '@Core/@types/feedTypes'

interface FeedProcessorExecutionContext {
	view: 'chat_feed' | 'profile_feed'
}

interface FeedEntryProcessedData {
	[key: string]: any
}

export type Middleware = (
	executionContext: FeedProcessorExecutionContext,
	context: FeedEntry,
	data: FeedEntryProcessedData
) => void

export default class FeedProcessorPipeline {
	private middlewares: Middleware[] = []

	constructor(private executionContext: FeedProcessorExecutionContext) {}

	use(middleware: Middleware) {
		this.middlewares.push(middleware)
	}

	process(context: FeedEntry, data: FeedEntryProcessedData) {
		const executionContext = this.executionContext
		const stack = [...this.middlewares]

		for (const middleware of stack) {
			middleware(executionContext, context, data)
		}
	}

	remove(middleware: Middleware) {
		const index = this.middlewares.indexOf(middleware)
		if (index !== -1) {
			this.middlewares.splice(index, 1)
		}
	}

	clear() {
		this.middlewares = []
	}
}
