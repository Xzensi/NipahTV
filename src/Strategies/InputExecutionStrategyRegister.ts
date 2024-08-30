import type { InputIntentDTO, InputExecutionStrategy } from './InputExecutionStrategy'
import type { ContentEditableEditor } from '../Classes/ContentEditableEditor'

export default class InputExecutionStrategyRegister {
	private strategies: InputExecutionStrategy[] = []

	registerStrategy(strategy: InputExecutionStrategy) {
		this.strategies.unshift(strategy)
	}

	unregisterStrategy(strategy: InputExecutionStrategy) {
		const index = this.strategies.indexOf(strategy)
		if (index > -1) {
			this.strategies.splice(index, 1)
		}
	}

	private findApplicableStrategy(inputIntentDTO: InputIntentDTO) {
		// DefaultRoutingStrategy is always applicable if no other strategy is applicable
		return this.strategies.find(x => x.shouldUseStrategy(inputIntentDTO)) || this.strategies[0]
	}

	async routeInput(
		contentEditableEditor: ContentEditableEditor,
		inputIntentDTO: InputIntentDTO,
		dontClearInput?: boolean
	): Promise<string | void> {
		return this.findApplicableStrategy(inputIntentDTO).route(contentEditableEditor, inputIntentDTO, dontClearInput)
	}
}
