import { ContentEditableEditor } from '../Classes/ContentEditableEditor'
import { MessagesHistory } from '../Classes/MessagesHistory'
import { TabCompletor } from '../Classes/TabCompletor'
import { SettingsManager } from './SettingsManager'
import { Clipboard2 } from '../Classes/Clipboard'
import { Publisher } from '../Classes/Publisher'
import { EmotesManager } from './EmotesManager'
import { UsersManager } from './UsersManager'
import { error, log } from '../utils'
import { Caret } from '../UserInterface/Caret'

export class InputController {
	contentEditableEditor: ContentEditableEditor
	settingsManager: SettingsManager
	messageHistory: MessagesHistory
	emotesManager: EmotesManager
	usersManager: UsersManager
	tabCompletor: TabCompletor
	eventBus: Publisher

	constructor(
		{
			settingsManager,
			eventBus,
			emotesManager,
			usersManager,
			clipboard
		}: {
			settingsManager: SettingsManager
			emotesManager: EmotesManager
			usersManager: UsersManager
			clipboard: Clipboard2
			eventBus: Publisher
		},
		textFieldEl: HTMLElement
	) {
		this.settingsManager = settingsManager
		this.emotesManager = emotesManager
		this.usersManager = usersManager
		this.eventBus = eventBus

		this.messageHistory = new MessagesHistory()
		this.contentEditableEditor = new ContentEditableEditor(
			{ eventBus, emotesManager, messageHistory: this.messageHistory, clipboard },
			textFieldEl
		)
		this.tabCompletor = new TabCompletor(
			{
				emotesManager,
				usersManager,
				contentEditableEditor: this.contentEditableEditor
			},
			textFieldEl.parentElement as HTMLElement
		)
	}

	initialize() {
		const { eventBus, contentEditableEditor } = this

		contentEditableEditor.attachEventListeners()

		contentEditableEditor.addEventListener('keydown', 9, (event: KeyboardEvent) => {
			// Typing any non-whitespace character means you commit to the selected history entry, so we reset the cursor
			if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
				this.messageHistory.resetCursor()
			}
		})

		eventBus.subscribe('ntv.ui.input_submitted', this.handleInputSubmit.bind(this))
	}

	handleInputSubmit({ suppressEngagementEvent }: any) {
		const { contentEditableEditor, emotesManager, messageHistory } = this

		if (!suppressEngagementEvent) {
			const emotesInMessage = contentEditableEditor.getEmotesInMessage()
			for (const emoteHid of emotesInMessage) {
				emotesManager.registerEmoteEngagement(emoteHid as string)
			}
		}

		if (!contentEditableEditor.isInputEmpty()) messageHistory.addMessage(contentEditableEditor.getInputHTML())
		messageHistory.resetCursor()
	}

	isShowingTabCompletorModal() {
		return this.tabCompletor.isShowingModal()
	}

	addEventListener(
		type: string,
		priority: number,
		listener: (event: any) => void,
		options?: AddEventListenerOptions
	) {
		this.contentEditableEditor.addEventListener(type, priority, listener, options)
	}

	loadTabCompletionBehaviour() {
		this.tabCompletor.attachEventHandlers()

		// Hide tab completion modal when clicking outside of it
		document.addEventListener('click', (e: MouseEvent) => {
			this.tabCompletor.maybeCloseWindowClick(e.target as Node)
		})
	}

	loadChatHistoryBehaviour() {
		const { settingsManager, contentEditableEditor } = this
		if (!settingsManager.getSetting('shared.chat.input.history.enabled')) return

		contentEditableEditor.addEventListener('keydown', 4, event => {
			if (this.tabCompletor.isShowingModal()) return

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
}
