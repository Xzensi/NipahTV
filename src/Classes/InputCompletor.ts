import type { AbstractNetworkInterface } from '../NetworkInterfaces/AbstractNetworkInterface'
import type { EmotesManager } from '../Managers/EmotesManager'
import type { ContentEditableEditor } from './ContentEditableEditor'
import type { UsersManager } from '../Managers/UsersManager'
import type { Publisher } from './Publisher'
import { CommandCompletionStrategy } from './CompletionStrategies/CommandCompletionStrategy'
import { MentionCompletionStrategy } from './CompletionStrategies/MentionCompletionStrategy'
import { EmoteCompletionStrategy } from './CompletionStrategies/EmoteCompletionStrategy'
import { error, log } from '../utils'

export class InputCompletor {
	private currentActiveStrategy?: EmoteCompletionStrategy | MentionCompletionStrategy | CommandCompletionStrategy

	private contentEditableEditor: ContentEditableEditor
	private networkInterface: AbstractNetworkInterface
	private emotesManager: EmotesManager
	private usersManager: UsersManager
	private containerEl: HTMLElement
	private eventBus: Publisher

	constructor(
		{
			contentEditableEditor,
			networkInterface,
			emotesManager,
			usersManager,
			eventBus
		}: {
			contentEditableEditor: ContentEditableEditor
			networkInterface: AbstractNetworkInterface
			emotesManager: EmotesManager
			usersManager: UsersManager
			eventBus: Publisher
		},
		containerEl: HTMLElement
	) {
		this.contentEditableEditor = contentEditableEditor
		this.networkInterface = networkInterface
		this.emotesManager = emotesManager
		this.usersManager = usersManager
		this.containerEl = containerEl
		this.eventBus = eventBus
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
					{
						eventBus: this.eventBus,
						networkInterface: this.networkInterface,
						contentEditableEditor: this.contentEditableEditor
					},
					this.containerEl
				)
			} else if (MentionCompletionStrategy.shouldUseStrategy(event)) {
				this.currentActiveStrategy = new MentionCompletionStrategy(
					{
						contentEditableEditor: this.contentEditableEditor,
						usersManager: this.usersManager
					},
					this.containerEl
				)
			} else if (EmoteCompletionStrategy.shouldUseStrategy(event)) {
				this.currentActiveStrategy = new EmoteCompletionStrategy(
					{
						contentEditableEditor: this.contentEditableEditor,
						emotesManager: this.emotesManager
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
