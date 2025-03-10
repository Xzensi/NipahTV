import ColonEmoteCompletionStrategy from '../Input/Completion/Strategies/ColonEmoteCompletionStrategy'
import CommandCompletionStrategy from '../Input/Completion/Strategies/CommandCompletionStrategy'
import MentionCompletionStrategy from '../Input/Completion/Strategies/MentionCompletionStrategy'
import InputCompletionStrategyManager from '../Input/Completion/InputCompletionStrategyManager'
import EmoteCompletionStrategy from '../Input/Completion/Strategies/EmoteCompletionStrategy'
import type { PriorityEventTarget } from '../Common/PriorityEventTarget'
import { ContentEditableEditor } from './ContentEditableEditor'
import MessagesHistory from './MessagesHistory'
import type Clipboard2 from '../Common/Clipboard'
import { Caret } from '../UI/Caret'

export default class InputController {
	private rootContext: RootContext
	private session: Session
	private messageHistory: MessagesHistory
	private inputCompletionStrategyManager: InputCompletionStrategyManager

	contentEditableEditor: ContentEditableEditor

	constructor(
		rootContext: RootContext,
		session: Session,
		{
			clipboard,
			submitButtonPriorityEventTarget
		}: {
			clipboard: Clipboard2
			submitButtonPriorityEventTarget: PriorityEventTarget
		},
		textFieldEl: HTMLElement
	) {
		this.rootContext = rootContext
		this.session = session

		this.messageHistory = new MessagesHistory()
		this.contentEditableEditor = new ContentEditableEditor(
			rootContext,
			session,
			{ messageHistory: this.messageHistory, clipboard },
			textFieldEl
		)

		const { inputCompletionStrategyRegister, channelData } = session
		const channelId = channelData.channelId

		this.inputCompletionStrategyManager = new InputCompletionStrategyManager(
			session,
			inputCompletionStrategyRegister,
			this.contentEditableEditor,
			textFieldEl.parentElement?.parentElement?.parentElement as HTMLElement
		)

		session.inputCompletionStrategyManager = this.inputCompletionStrategyManager

		if (rootContext.settingsManager.getSetting(channelId, 'chat.input.completion.commands.enabled')) {
			inputCompletionStrategyRegister.registerStrategy(
				new CommandCompletionStrategy(
					rootContext,
					session,
					this.contentEditableEditor,
					this.inputCompletionStrategyManager.navListWindowManager
				)
			)
		}

		if (rootContext.settingsManager.getSetting(channelId, 'chat.input.completion.mentions.enabled')) {
			inputCompletionStrategyRegister.registerStrategy(
				new MentionCompletionStrategy(
					rootContext,
					session,
					this.contentEditableEditor,
					this.inputCompletionStrategyManager.navListWindowManager
				)
			)
		}

		if (rootContext.settingsManager.getSetting(channelId, 'chat.input.completion.emotes.enabled')) {
			inputCompletionStrategyRegister.registerStrategy(
				new EmoteCompletionStrategy(
					rootContext,
					session,
					this.contentEditableEditor,
					this.inputCompletionStrategyManager.navListWindowManager
				)
			)
		}

		if (rootContext.settingsManager.getSetting(channelId, 'chat.input.completion.colon_emotes.enabled')) {
			inputCompletionStrategyRegister.registerStrategy(
				new ColonEmoteCompletionStrategy(
					rootContext,
					session,
					this.contentEditableEditor,
					this.inputCompletionStrategyManager.navListWindowManager
				)
			)
		}
	}

	initialize() {
		const { contentEditableEditor } = this
		const { eventBus } = this.session

		contentEditableEditor.attachEventListeners()

		contentEditableEditor.addEventListener('keydown', 9, (event: KeyboardEvent) => {
			// Typing any non-whitespace character means you commit to the selected history entry, so we reset the cursor
			if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
				this.messageHistory.resetCursor()
			}
		})

		eventBus.subscribe('ntv.ui.submit_input', this.handleInputSubmit.bind(this))
	}

	addEventListener(
		type: string,
		priority: number,
		listener: (event: any) => void,
		options?: AddEventListenerOptions
	) {
		this.contentEditableEditor.addEventListener(type, priority, listener, options)
	}

	loadInputCompletionBehaviour() {
		// Input completion strategy manager event handlers
		// this.contentEditableEditor.addEventListener(
		// 	'keydown',
		// 	8,
		// 	this.inputCompletionStrategyManager.handleBlockingKeyDownEvent.bind(this.inputCompletionStrategyManager)
		// )
		this.contentEditableEditor.addEventListener(
			'keydown',
			8,
			this.inputCompletionStrategyManager.handleKeyDownEvent.bind(this.inputCompletionStrategyManager)
		)
		this.contentEditableEditor.addEventListener(
			'keyup',
			10,
			this.inputCompletionStrategyManager.handleKeyUpEvent.bind(this.inputCompletionStrategyManager)
		)
	}

	loadChatHistoryBehaviour() {
		const { settingsManager } = this.rootContext
		const { contentEditableEditor } = this

		const channelId = this.session.channelData.channelId
		if (!settingsManager.getSetting(channelId, 'chat.input.history.enabled')) return

		contentEditableEditor.addEventListener('keydown', 4, event => {
			if (this.inputCompletionStrategyManager.hasNavListWindows()) return

			const textFieldEl = contentEditableEditor.getInputNode()

			if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
				// Check if caret is at the start of the text field
				if (Caret.isCaretAtStartOfNode(textFieldEl) && event.key === 'ArrowUp') {
					event.preventDefault()

					if (!this.messageHistory.canMoveCursor(1)) return

					// Store leftover html in case history traversal was accidental
					const leftoverHTML = contentEditableEditor.getInputHTML()
					if (this.messageHistory.isCursorAtStart() && leftoverHTML) {
						this.messageHistory.addMessage(leftoverHTML)
						this.messageHistory.moveCursor(2)
					} else {
						this.messageHistory.moveCursor(1)
					}

					contentEditableEditor.setInputContent(this.messageHistory.getMessage())
				} else if (Caret.isCaretAtEndOfNode(textFieldEl) && event.key === 'ArrowDown') {
					event.preventDefault()

					// Reached most recent message traversing down history
					if (this.messageHistory.canMoveCursor(-1)) {
						this.messageHistory.moveCursor(-1)
						contentEditableEditor.setInputContent(this.messageHistory.getMessage())
					} else {
						// Store leftover html in case history traversal was accidental
						if (!contentEditableEditor.isInputEmpty())
							this.messageHistory.addMessage(contentEditableEditor.getInputHTML())

						// Moved past most recent message, empty text field
						this.messageHistory.resetCursor()
						contentEditableEditor.clearInput()
					}
				}
			}
		})
	}

	handleInputSubmit({ suppressEngagementEvent }: { suppressEngagementEvent: boolean }) {
		const { emotesManager } = this.session
		const { contentEditableEditor, messageHistory } = this

		if (!suppressEngagementEvent) {
			const emotesInMessage = contentEditableEditor.getEmotesInMessage()
			for (const emoteHid of emotesInMessage) {
				emotesManager.registerEmoteEngagement(emoteHid as string)
			}
		}

		if (!contentEditableEditor.isInputEmpty()) messageHistory.addMessage(contentEditableEditor.getInputHTML())
		messageHistory.resetCursor()
	}

	isShowingInputCompletorNavListWindow() {
		return this.inputCompletionStrategyManager.hasNavListWindows()
	}

	destroy() {
		this.contentEditableEditor.destroy()
	}
}
