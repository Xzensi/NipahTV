import type { AbstractNetworkInterface } from '../NetworkInterfaces/AbstractNetworkInterface'
import type { SettingsManager } from './SettingsManager'
import type { Clipboard2 } from '../Classes/Clipboard'
import type { Publisher } from '../Classes/Publisher'
import type { EmotesManager } from './EmotesManager'
import type { UsersManager } from './UsersManager'

import { ContentEditableEditor } from '../Classes/ContentEditableEditor'
import { MessagesHistory } from '../Classes/MessagesHistory'
import { InputCompletor } from '../Classes/InputCompletor'
import { Caret } from '../UserInterface/Caret'
import { error, log } from '../utils'

export class InputController {
	private rootContext: RootContext
	private session: Session
	private messageHistory: MessagesHistory
	private tabCompletor: InputCompletor

	contentEditableEditor: ContentEditableEditor

	constructor(
		rootContext: RootContext,
		session: Session,
		{
			clipboard
		}: {
			clipboard: Clipboard2
		},
		textFieldEl: HTMLElement
	) {
		this.rootContext = rootContext
		this.session = session

		this.messageHistory = new MessagesHistory()
		this.contentEditableEditor = new ContentEditableEditor(
			this.rootContext,
			{ messageHistory: this.messageHistory, clipboard },
			textFieldEl
		)
		this.tabCompletor = new InputCompletor(
			rootContext,
			session,
			{
				contentEditableEditor: this.contentEditableEditor
			},
			textFieldEl.parentElement as HTMLElement
		)
	}

	initialize() {
		const { eventBus } = this.rootContext
		const { contentEditableEditor } = this

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
		const { emotesManager } = this.rootContext
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
		const { settingsManager } = this.rootContext
		const { contentEditableEditor } = this
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
