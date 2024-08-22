import type { AbstractCompletionStrategy } from './CompletionStrategies/AbstractCompletionStrategy'
import { CommandCompletionStrategy } from './CompletionStrategies/CommandCompletionStrategy'
import { EmoteCompletionStrategy } from './CompletionStrategies/EmoteCompletionStrategy'
import { MentionCompletionStrategy } from './CompletionStrategies/MentionCompletionStrategy'
import type { ContentEditableEditor } from './ContentEditableEditor'

interface CompletionStrategyStatic {
	shouldUseStrategy(event: Event, contentEditableEditor: ContentEditableEditor): boolean
}

type WrappedStrategy = {
	constructor: (new (...args: any[]) => AbstractCompletionStrategy) & CompletionStrategyStatic
	dependencies?: {}
}

export class InputCompletionStrategyRegistry {
	private strategies: WrappedStrategy[] = [
		{
			constructor: EmoteCompletionStrategy
		},
		{
			constructor: MentionCompletionStrategy
		},
		{
			constructor: CommandCompletionStrategy
		}
	]

	registerStrategy(wrappedStrategy: WrappedStrategy) {
		if (!this.strategies.find(x => x.constructor === wrappedStrategy.constructor))
			this.strategies.push(wrappedStrategy)
	}

	unregisterStrategy(strategyConstructor: WrappedStrategy['constructor']) {
		this.strategies = this.strategies.filter(x => x.constructor != strategyConstructor)
	}

	findApplicableStrategy(event: Event, editor: ContentEditableEditor): WrappedStrategy | undefined {
		return this.strategies.find(x => x.constructor.shouldUseStrategy(event, editor))
	}
}
