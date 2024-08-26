import type { AbstractCompletionStrategy } from './InputCompletionStrategies/AbstractCompletionStrategy'
import { CommandCompletionStrategy } from './InputCompletionStrategies/CommandCompletionStrategy'
import { EmoteCompletionStrategy } from './InputCompletionStrategies/EmoteCompletionStrategy'
import { MentionCompletionStrategy } from './InputCompletionStrategies/MentionCompletionStrategy'
import type { ContentEditableEditor } from '../Classes/ContentEditableEditor'

interface CompletionStrategyStatic {
	shouldUseStrategy(event: Event, contentEditableEditor: ContentEditableEditor): boolean
}

interface WrappedStrategy {
	constructor: (new (...args: any[]) => AbstractCompletionStrategy) & CompletionStrategyStatic
	dependencies?: {}
}

export class InputCompletionStrategyRegister {
	private strategies: WrappedStrategy[] = [
		{
			constructor: CommandCompletionStrategy
		},
		{
			constructor: MentionCompletionStrategy
		},
		{
			constructor: EmoteCompletionStrategy
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
