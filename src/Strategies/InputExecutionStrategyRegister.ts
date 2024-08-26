import { InputIntentDTO, InputExecutionStrategy as InputExecutionStrategy } from './InputExecutionStrategy'

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

	async routeInput(inputIntentDTO: InputIntentDTO): Promise<string | void> {
		return await this.findApplicableStrategy(inputIntentDTO).route(inputIntentDTO)
	}
}
