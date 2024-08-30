import type AbstractInputCompletionStrategy from './InputCompletionStrategies/AbstractInputCompletionStrategy'
import type { ContentEditableEditor } from '../Classes/ContentEditableEditor'

export default class InputCompletionStrategyRegister {
	private fullLineStrategies: AbstractInputCompletionStrategy[] = []
	private inlineStrategies: AbstractInputCompletionStrategy[] = []

	registerStrategy(strategy: AbstractInputCompletionStrategy) {
		if (strategy.isFullLineStrategy) {
			if (this.fullLineStrategies.find(x => x.constructor === strategy.constructor))
				throw new Error('Full line strategy already registered')

			this.fullLineStrategies.push(strategy)
		} else {
			if (this.inlineStrategies.find(x => x.constructor === strategy.constructor))
				throw new Error('Inline strategy already registered')

			this.inlineStrategies.push(strategy)
		}
	}

	unregisterStrategy(strategy: AbstractInputCompletionStrategy) {
		if (strategy.isFullLineStrategy) {
			const index = this.fullLineStrategies.findIndex(x => x.constructor === strategy.constructor)
			if (index === -1) throw new Error('Full line strategy not registered')

			this.fullLineStrategies.splice(index, 1)
		} else {
			const index = this.inlineStrategies.findIndex(x => x.constructor === strategy.constructor)
			if (index === -1) throw new Error('Inline strategy not registered')

			this.inlineStrategies.splice(index, 1)
		}
	}

	findApplicableFullLineStrategy(event: KeyboardEvent | MouseEvent, editor: ContentEditableEditor) {
		return this.fullLineStrategies.find(x => x.shouldUseStrategy(event, editor))
	}

	findApplicableInlineStrategy(event: KeyboardEvent | MouseEvent, editor: ContentEditableEditor) {
		return this.inlineStrategies.find(x => x.shouldUseStrategy(event, editor))
	}
}
