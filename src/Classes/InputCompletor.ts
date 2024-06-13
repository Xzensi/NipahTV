import type { ContentEditableEditor } from './ContentEditableEditor'
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

	constructor(
		rootContext: RootContext,
		session: Session,
		{
			contentEditableEditor
		}: {
			contentEditableEditor: ContentEditableEditor
		},
		containerEl: HTMLElement
	) {
		this.rootContext = rootContext
		this.session = session
		this.contentEditableEditor = contentEditableEditor
		this.containerEl = containerEl
	}

	attachEventHandlers() {
		this.contentEditableEditor.addEventListener('keydown', 8, this.handleKeyDown.bind(this))
		this.contentEditableEditor.addEventListener('keyup', 10, this.handleKeyUp.bind(this))
	}

	isShowingModal() {
		return this.currentActiveStrategy?.isShowingNavWindow() || false
	}

	maybeCloseWindowClick(node: Node) {
		if (this.currentActiveStrategy && !this.currentActiveStrategy.isClickInsideNavWindow(node)) {
			this.reset()
		}
	}

	handleKeyDown(event: KeyboardEvent) {
		if (!this.currentActiveStrategy) {
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
					{
						contentEditableEditor: this.contentEditableEditor
					},
					this.containerEl
				)
			} else if (EmoteCompletionStrategy.shouldUseStrategy(event)) {
				this.currentActiveStrategy = new EmoteCompletionStrategy(
					this.rootContext,
					{
						contentEditableEditor: this.contentEditableEditor
					},
					this.containerEl
				)
			}
		}

		if (this.currentActiveStrategy) {
			this.currentActiveStrategy.handleKeyDown(event)

			if (this.currentActiveStrategy.destroyed) {
				delete this.currentActiveStrategy
			}
		}
	}

	handleKeyUp(event: KeyboardEvent) {
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

	reset() {
		this.currentActiveStrategy?.destroy()
		delete this.currentActiveStrategy
	}
}
