import { ContentEditableEditor } from './ContentEditableEditor'
import { EmotesManager } from '../Managers/EmotesManager'
import { UsersManager } from '../Managers/UsersManager'
import { Caret } from '../UserInterface/Caret'
import { error, log, parseHTML } from '../utils'
import { NavigatableEntriesWindowComponent } from '../UserInterface/Components/NavigatableEntriesWindowComponent'

export class TabCompletor {
	private mode = ''
	private navWindow?: NavigatableEntriesWindowComponent

	// Context
	private start = 0
	private end = 0
	private mentionEnd = 0
	private node: Node | null = null
	private word: string | null = null
	private emoteComponent: HTMLElement | null = null

	private emotesManager: EmotesManager
	private usersManager: UsersManager
	private contentEditableEditor: ContentEditableEditor
	private containerEl: HTMLElement

	constructor(
		{
			contentEditableEditor,
			emotesManager,
			usersManager
		}: {
			contentEditableEditor: ContentEditableEditor
			emotesManager: EmotesManager
			usersManager: UsersManager
		},
		containerEl: HTMLElement
	) {
		this.emotesManager = emotesManager
		this.usersManager = usersManager
		this.contentEditableEditor = contentEditableEditor
		this.containerEl = containerEl
	}

	attachEventHandlers() {
		const { contentEditableEditor: contentEditableEditor } = this
		contentEditableEditor.addEventListener('keydown', 8, this.handleKeydown.bind(this))

		contentEditableEditor.addEventListener('keyup', 10, (event: KeyboardEvent) => {
			if (this.navWindow && contentEditableEditor.isInputEmpty()) {
				this.reset()
			}
		})
	}

	updateSuggestions() {
		// TODO implement automatic cancelling of processing to prevent UI lag and hangups
		//  Maybe use a web worker for this

		// Get word before caret
		const { word, start, end, node } = Caret.getWordBeforeCaret()
		if (!word) return

		this.word = word
		this.start = start
		this.end = end
		this.node = node

		if (!this.navWindow) return error('Tab completion window does not exist yet')

		// @ User mention suggestions
		if (word[0] === '@') {
			this.mode = 'mention'

			const searchResults = this.usersManager.searchUsers(word.substring(1, 20), 20)
			const suggestions = searchResults.map((result: any) => result.item.name)
			const suggestionHids = searchResults.map((result: any) => result.item.id)

			if (suggestions.length) {
				for (let i = 0; i < suggestions.length; i++) {
					const userName = suggestions[i]
					const userId = suggestionHids[i]

					this.navWindow.addEntry(
						{ userId, userName },
						parseHTML(`<li data-user-id="${userId}"><span>@${userName}</span></li>`, true) as HTMLElement
					)
				}

				this.navWindow.setSelectedIndex(0)
				this.renderInlineUserMention()
			}
		}

		// Emote suggestions
		else {
			this.mode = 'emote'

			const searchResults = this.emotesManager.searchEmotes(word.substring(0, 20), 20)
			// log('Search results:', searchResults)
			const suggestions = searchResults.map((result: any) => result.item.name)
			const suggestionHids = searchResults.map((result: any) =>
				this.emotesManager.getEmoteHidByName(result.item.name)
			)

			if (suggestions.length) {
				for (let i = 0; i < suggestions.length; i++) {
					const emoteName = suggestions[i]
					const emoteHid = suggestionHids[i]
					const emoteRender = this.emotesManager.getRenderableEmoteByHid(emoteHid, 'ntv__emote')

					this.navWindow.addEntry(
						{ emoteHid },
						parseHTML(
							`<li data-emote-hid="${emoteHid}">${emoteRender}<span>${emoteName}</span></li>`,
							true
						) as HTMLElement
					)
				}

				this.navWindow.setSelectedIndex(0)
				this.renderInlineEmote()
			}
		}
	}

	createModal() {
		if (this.navWindow) return error('Tab completion window already exists')

		const navWindow = new NavigatableEntriesWindowComponent(this.containerEl as HTMLElement, 'ntv__tab-completion')
		this.navWindow = navWindow.init()

		this.navWindow.addEventListener('entry-click', (event: Event) => {
			if (this.mode === 'emote') this.renderInlineEmote()
			else if (this.mode === 'mention') {
				Caret.moveCaretTo(this.node!, this.mentionEnd)
				this.contentEditableEditor.insertText(' ')
			}

			this.destroyModal()
			this.reset()
		})
	}

	destroyModal() {
		if (!this.navWindow) return error('Tab completion window does not exist yet')
		this.navWindow.destroy()
		delete this.navWindow
	}

	moveSelectorUp() {
		this.navWindow!.moveSelectorUp()

		if (this.mode === 'emote') this.renderInlineEmote()
		else if (this.mode === 'mention') {
			this.restoreOriginalText()
			this.renderInlineUserMention()
		}
	}

	moveSelectorDown() {
		this.navWindow!.moveSelectorDown()

		if (this.mode === 'emote') this.renderInlineEmote()
		else if (this.mode === 'mention') {
			this.restoreOriginalText()
			this.renderInlineUserMention()
		}
	}

	renderInlineUserMention() {
		if (!this.navWindow) return error('Tab completion window does not exist yet')
		if (!this.node) return error('Invalid node to render inline user mention')

		const entry = this.navWindow.getSelectedEntry()
		if (!entry) return error('No selected entry to render inline user mention')

		const { userId, userName } = entry
		const userMention = `@${userName}`
		this.mentionEnd = Caret.replaceTextInRange(this.node, this.start, this.end, userMention)
		Caret.moveCaretTo(this.node, this.mentionEnd)
		this.contentEditableEditor.processInputContent()
	}

	restoreOriginalText() {
		if (this.mode === 'emote' && this.word) {
			if (!this.emoteComponent) return error('Invalid embed node to restore original text')

			this.contentEditableEditor.replaceEmoteWithText(this.emoteComponent, this.word)
		} else if (this.mode === 'mention') {
			if (!this.node) return error('Invalid node to restore original text')

			Caret.replaceTextInRange(this.node, this.start, this.mentionEnd, this.word || '')
			Caret.moveCaretTo(this.node, this.end)
			this.contentEditableEditor.processInputContent()
		}
	}

	renderInlineEmote() {
		if (!this.navWindow) return error('Tab completion window does not exist')

		const selectedEntry = this.navWindow.getSelectedEntry()
		if (!selectedEntry) return error('No selected entry to render inline emote')

		const emoteHid = selectedEntry.emoteHid as string
		if (!emoteHid) return error('No emote hid to render inline emote')

		if (this.emoteComponent) {
			this.contentEditableEditor.replaceEmote(this.emoteComponent, emoteHid)
		} else {
			if (!this.node) return error('Invalid node to restore original text')

			const range = document.createRange()
			range.setStart(this.node, this.start)
			range.setEnd(this.node, this.end)

			const selection = window.getSelection()
			if (selection) {
				selection.removeAllRanges()
				selection.addRange(range)
			}

			range.deleteContents()
			this.contentEditableEditor.normalize()
			this.emoteComponent = this.contentEditableEditor.insertEmote(emoteHid)
		}
	}

	isClickInsideModal(target: Node) {
		return this.navWindow?.containsNode(target) || false
	}

	isShowingModal() {
		return !!this.navWindow
	}

	maybeCloseWindowClick(node: Node) {
		if (this.navWindow && !this.navWindow.containsNode(node)) {
			this.destroyModal()
			this.reset()
		}
	}

	handleKeydown(evt: KeyboardEvent) {
		if (this.navWindow) {
			if (evt.key === 'Tab') {
				evt.preventDefault()

				// Traverse tab completion suggestions up/down depending on whether shift is held with tab
				if (evt.shiftKey) {
					this.moveSelectorDown()
				} else {
					this.moveSelectorUp()
				}
			} else if (evt.key === 'ArrowUp') {
				evt.preventDefault()

				this.moveSelectorUp()
			} else if (evt.key === 'ArrowDown') {
				evt.preventDefault()

				this.moveSelectorDown()
			} else if (evt.key === 'ArrowRight' || evt.key === 'Enter') {
				if (evt.key === 'Enter') {
					evt.preventDefault()
					evt.stopPropagation()
				}

				if (this.mode === 'mention') this.contentEditableEditor.insertText(' ')

				this.destroyModal()
				this.reset()
			} else if (evt.key === ' ') {
				if (this.mode === 'emote') {
					evt.preventDefault()
					evt.stopPropagation()
				}
				this.reset()
			} else if (evt.key === 'ArrowLeft' || evt.key === 'Escape') {
				this.reset()
			} else if (evt.key === 'Backspace') {
				evt.preventDefault()
				evt.stopImmediatePropagation()

				this.restoreOriginalText()
				this.destroyModal()
				this.reset()
			} else if (evt.key === 'Shift') {
				// Ignore shift key press
			} else {
				this.destroyModal()
				this.reset()
			}
		} else if (evt.key === 'Tab') {
			evt.preventDefault()

			// Show tab completion modal
			this.createModal()
			this.updateSuggestions()

			if (!this.navWindow!.getEntriesCount()) this.reset()
		}
	}

	handleKeyup(evt: KeyboardEvent) {}

	reset() {
		this.mode = ''
		this.start = 0
		this.end = 0
		this.mentionEnd = 0
		this.node = null
		this.word = null
		this.emoteComponent = null

		if (this.navWindow) this.destroyModal()
		delete this.navWindow
	}
}
