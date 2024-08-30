import type AbstractInputCompletionStrategy from '../Strategies/InputCompletionStrategies/AbstractInputCompletionStrategy'
import InputCompletionStrategyRegister from '../Strategies/InputCompletionStrategyRegister'
import NavigatableListWindowManager from './NavigatableListWindowManager'
import { ContentEditableEditor } from '../Classes/ContentEditableEditor'

export default class InputCompletionStrategyManager {
	readonly navListWindowManager: NavigatableListWindowManager

	// Full line strategy that will be used for full line completions (e.g. /commands)
	//  Always takes precedence over inline strategy
	private fullLineStrategy: AbstractInputCompletionStrategy | null = null

	// Inline strategy that will only be used for inline completions (e.g. @mentions, emotes)
	//  Full line strategy can delegate to this strategy if it wants to
	private inlineStrategy: AbstractInputCompletionStrategy | null = null

	private clickEventHandler: (event: MouseEvent) => void

	constructor(
		session: Session,
		private inputCompletionStrategyRegister: InputCompletionStrategyRegister,
		private contentEditableEditor: ContentEditableEditor,
		navWindowManagerContainerEl: HTMLElement
	) {
		this.navListWindowManager = new NavigatableListWindowManager(navWindowManagerContainerEl)

		this.clickEventHandler = this.handleClickEvent.bind(this)
		document.addEventListener('click', this.clickEventHandler)

		session.eventBus.subscribe('ntv.input_controller.empty_input', () => {
			this.resetStrategies()
		})
	}

	handleClickEvent(event: MouseEvent) {
		let clickIsInInput = false
		if (this.fullLineStrategy || this.inlineStrategy) {
			clickIsInInput = this.contentEditableEditor.isClickEventInInput(event)
		}

		if (this.fullLineStrategy) {
			if (this.fullLineStrategy.allowInlineStrategyDelegation && this.inlineStrategy) {
				const stopUsingInlineStrategy = this.inlineStrategy.handleClickEvent(event, clickIsInInput)
				if (stopUsingInlineStrategy) this.resetInlineStrategy()

				// We don't return here to prevent the full line strategy from closing the nav window as well.
				//  This way we can "exit" the inline strategy back to the full line strategy.
				return
			}

			const stopUsingFullLineStrategy = this.fullLineStrategy.handleClickEvent(event, clickIsInInput)
			if (stopUsingFullLineStrategy) this.resetStrategies()
		} else if (this.inlineStrategy) {
			const stopUsingInlineStrategy = this.inlineStrategy.handleClickEvent(event, clickIsInInput)
			if (stopUsingInlineStrategy) this.resetInlineStrategy()
		}
	}

	handleBlockingKeyDownEvent(event: KeyboardEvent) {
		const { contentEditableEditor } = this

		if (this.inlineStrategy) {
			const shouldUseStrategy = this.inlineStrategy.shouldUseStrategy(event, contentEditableEditor)

			if (shouldUseStrategy) {
				const stopUsingInlineStrategy = this.inlineStrategy.handleBlockingKeyDownEvent(event)

				if (stopUsingInlineStrategy) {
					this.resetInlineStrategy()
				}
			} else {
				this.resetInlineStrategy()
			}
		}

		if (this.fullLineStrategy) {
			const shouldUseStrategy = this.fullLineStrategy.shouldUseStrategy(event, contentEditableEditor)

			if (shouldUseStrategy) {
				const stopUsingFullLineStrategy = this.fullLineStrategy.handleBlockingKeyDownEvent(event)

				if (stopUsingFullLineStrategy) {
					this.resetStrategies()
				}
			} else {
				this.resetStrategies()
			}
		}
	}

	handleKeyDownEvent(event: KeyboardEvent) {
		const { inputCompletionStrategyRegister, contentEditableEditor } = this

		/**
		 * First try to use any relevant full line strategies.
		 * Fall back to inline strategies if no full line strategies are applicable.
		 *
		 * If a full line strategy is used, check if it allows delegation to inline strategies,
		 *   to allow inline strategies to be used in conjunction with full line strategies.
		 */

		this.fullLineStrategy =
			this.fullLineStrategy ||
			inputCompletionStrategyRegister.findApplicableFullLineStrategy(event, contentEditableEditor) ||
			null

		if (this.fullLineStrategy) {
			// Check if the full line strategy allows delegation to inline strategies
			if (this.fullLineStrategy.allowInlineStrategyDelegation) {
				this.inlineStrategy =
					this.inlineStrategy ||
					inputCompletionStrategyRegister.findApplicableInlineStrategy(event, contentEditableEditor) ||
					null

				if (this.inlineStrategy) {
					const stopUsingInlineStrategy = this.inlineStrategy.handleKeyDownEvent(event)

					if (stopUsingInlineStrategy) {
						this.resetInlineStrategy()
						// We don't return here because we return control to the full line strategy
					} else {
						return
					}
				}
			} else if (this.inlineStrategy) {
				// Looks like there was already an inline strategy in use, but
				//   the full line strategy doesn't allow delegation, so we clean it up.
				//
				// This is a bit of a weird case, but it's possible if e.g. the user inputs
				//  a foward slash in front of emote to start a command, after emote completion
				//  was already in progress.
				this.resetInlineStrategy()
			}

			const stopUsingFullLineStrategy = this.fullLineStrategy.handleKeyDownEvent(event)
			if (stopUsingFullLineStrategy) {
				this.resetStrategies()
			}

			return // Don't continue to inline strategies if a full line strategy is in use and doesn't allow delegation.
		}

		this.inlineStrategy =
			this.inlineStrategy ||
			inputCompletionStrategyRegister.findApplicableInlineStrategy(event, contentEditableEditor) ||
			null

		if (this.inlineStrategy) {
			const stopUsingInlineStrategy = this.inlineStrategy.handleKeyDownEvent(event)

			if (stopUsingInlineStrategy) {
				this.resetStrategies()
			}
		}
	}

	handleKeyUpEvent(event: KeyboardEvent) {
		if (this.fullLineStrategy) {
			if (this.fullLineStrategy.allowInlineStrategyDelegation && this.inlineStrategy) {
				const stopUsingInlineStrategy = this.inlineStrategy.handleKeyUpEvent(event)
				if (stopUsingInlineStrategy) {
					this.resetInlineStrategy()
				} else {
					return
				}
			}

			const stopUsingFullLineStrategy = this.fullLineStrategy.handleKeyUpEvent(event)
			if (stopUsingFullLineStrategy) {
				this.resetStrategies()
				return
			}
		}

		if (this.inlineStrategy) {
			const stopUsingInlineStrategy = this.inlineStrategy.handleKeyUpEvent(event)
			if (stopUsingInlineStrategy) {
				this.resetInlineStrategy()
			}
		}
	}

	hasNavListWindows() {
		return this.navListWindowManager.hasNavListWindows()
	}

	private resetStrategies() {
		if (this.fullLineStrategy) {
			this.fullLineStrategy.reset()
			this.fullLineStrategy = null
		}

		this.resetInlineStrategy()
	}

	private resetInlineStrategy() {
		if (this.inlineStrategy) {
			this.inlineStrategy.reset()
			this.inlineStrategy = null
		}
	}

	destroy() {
		document.removeEventListener('click', this.clickEventHandler)
		this.navListWindowManager.destroyAllWindows()
		this.resetStrategies()
	}
}
