import type { ContentEditableEditor } from './ContentEditableEditor'
import type { PriorityEventTarget } from './PriorityEventTarget'
import { CommandCompletionStrategy } from './CompletionStrategies/CommandCompletionStrategy'
import { MentionCompletionStrategy } from './CompletionStrategies/MentionCompletionStrategy'
import { EmoteCompletionStrategy } from './CompletionStrategies/EmoteCompletionStrategy'
import { error, log } from '../utils'

export class InputCompletor {
	private currentActiveStrategy?: EmoteCompletionStrategy | MentionCompletionStrategy | CommandCompletionStrategy

	private rootContext: RootContext
	private session: Session
	private contentEditableEditor: ContentEditableEditor
	private containerEl: HTMLElement
	private submitButtonPriorityEventTarget: PriorityEventTarget

	constructor(
		rootContext: RootContext,
		session: Session,
		{
			contentEditableEditor,
			submitButtonPriorityEventTarget
		}: {
			contentEditableEditor: ContentEditableEditor
			submitButtonPriorityEventTarget: PriorityEventTarget
		},
		containerEl: HTMLElement
	) {
		this.rootContext = rootContext
		this.session = session
		this.contentEditableEditor = contentEditableEditor
		this.containerEl = containerEl
		this.submitButtonPriorityEventTarget = submitButtonPriorityEventTarget
	}

	attachEventHandlers() {
		this.contentEditableEditor.addEventListener('keydown', 8, this.handleKeyDown.bind(this))
		this.contentEditableEditor.addEventListener('keyup', 10, this.handleKeyUp.bind(this))
		this.submitButtonPriorityEventTarget.addEventListener('click', 9, this.handleSubmitButton.bind(this))
	}

	isShowingModal() {
		return this.currentActiveStrategy?.isShowingNavWindow() || false
	}

	maybeCloseWindowClick(node: Node) {
		if (this.currentActiveStrategy && !this.currentActiveStrategy.isClickInsideNavWindow(node)) {
			this.reset()
		}
	}

	private maybeSetStrategy(event: Event) {
		if (this.currentActiveStrategy) return

		if (CommandCompletionStrategy.shouldUseStrategy(event, this.contentEditableEditor)) {
			this.currentActiveStrategy = new CommandCompletionStrategy(
				this.rootContext,
				this.session,
				{
					contentEditableEditor: this.contentEditableEditor
				},
				this.containerEl
			)
		} else if (MentionCompletionStrategy.shouldUseStrategy(event)) {
			this.currentActiveStrategy = new MentionCompletionStrategy(
				this.rootContext,
				this.session,
				{
					contentEditableEditor: this.contentEditableEditor
				},
				this.containerEl
			)
		} else if (EmoteCompletionStrategy.shouldUseStrategy(event)) {
			this.currentActiveStrategy = new EmoteCompletionStrategy(
				this.rootContext,
				this.session,
				{
					contentEditableEditor: this.contentEditableEditor
				},
				this.containerEl
			)
		}
	}

	private handleKeyDown(event: KeyboardEvent) {
		this.maybeSetStrategy(event)

		if (this.currentActiveStrategy) {
			this.currentActiveStrategy.handleKeyDown(event)

			if (this.currentActiveStrategy.destroyed) {
				delete this.currentActiveStrategy
			}
		}
	}

	private handleKeyUp(event: KeyboardEvent) {
		const { contentEditableEditor: contentEditableEditor } = this

		if (this.currentActiveStrategy) {
			if (contentEditableEditor.isInputEmpty()) {
				this.reset()
				return
			}

			this.currentActiveStrategy.handleKeyUp(event)

			if (this.currentActiveStrategy.destroyed) {
				delete this.currentActiveStrategy
			}
		}
	}

	private handleSubmitButton(event: MouseEvent) {
		this.maybeSetStrategy(event)

		if (this.currentActiveStrategy) {
			this.currentActiveStrategy.handleSubmitButton(event)

			if (this.currentActiveStrategy.destroyed) {
				delete this.currentActiveStrategy
			}
		}
	}

	reset() {
		this.currentActiveStrategy?.destroy()
		delete this.currentActiveStrategy
	}
}
