import { ContentEditableEditor } from './ContentEditableEditor'
import { EmotesManager } from '../Managers/EmotesManager'
import { UsersManager } from '../Managers/UsersManager'
import { Caret } from '../UserInterface/Caret'
import { error, log } from '../utils'

export class TabCompletor {
	private suggestions = []
	private suggestionHids = []
	private selectedIndex = 0
	private mode = ''
	private $list?: JQuery<HTMLElement>
	private $modal?: JQuery<HTMLElement>

	isShowingModal = false

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

	constructor({
		contentEditableEditor,
		emotesManager,
		usersManager
	}: {
		contentEditableEditor: ContentEditableEditor
		emotesManager: EmotesManager
		usersManager: UsersManager
	}) {
		this.emotesManager = emotesManager
		this.usersManager = usersManager
		this.contentEditableEditor = contentEditableEditor
	}

	attachEventHandlers() {
		const { contentEditableEditor: contentEditableEditor } = this
		contentEditableEditor.addEventListener('keydown', 8, this.handleKeydown.bind(this))

		contentEditableEditor.addEventListener('keyup', 10, (event: KeyboardEvent) => {
			if (this.isShowingModal && contentEditableEditor.isInputEmpty()) {
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

		// @ User mention suggestions
		if (word[0] === '@') {
			this.mode = 'mention'

			const searchResults = this.usersManager.searchUsers(word.substring(1, 20), 20)
			this.suggestions = searchResults.map((result: any) => result.item.name)
			this.suggestionHids = searchResults.map((result: any) => result.item.id)

			if (!this.$list) return error('Tab completion list not created')
			this.$list.empty()

			if (this.suggestions.length) {
				for (let i = 0; i < this.suggestions.length; i++) {
					const userName = this.suggestions[i]
					const userId = this.suggestionHids[i]
					this.$list.append(`<li data-user-id="${userId}"><span>@${userName}</span></li>`)
				}

				this.$list.find('li').eq(this.selectedIndex).addClass('selected')
				this.renderInlineUserMention()
				this.scrollSelectedIntoView()
			}
		}

		// Emote suggestions
		else {
			this.mode = 'emote'

			const searchResults = this.emotesManager.searchEmotes(word.substring(0, 20), 20)
			// log('Search results:', searchResults)
			this.suggestions = searchResults.map((result: any) => result.item.name)
			this.suggestionHids = searchResults.map((result: any) =>
				this.emotesManager.getEmoteHidByName(result.item.name)
			)

			if (!this.$list) return error('Tab completion list not created')
			this.$list.empty()

			if (this.suggestions.length) {
				for (let i = 0; i < this.suggestions.length; i++) {
					const emoteName = this.suggestions[i]
					const emoteHid = this.suggestionHids[i]
					const emoteRender = this.emotesManager.getRenderableEmoteByHid(emoteHid, 'ntv__emote')
					this.$list.append(`<li data-emote-hid="${emoteHid}">${emoteRender}<span>${emoteName}</span></li>`)
				}

				this.$list.find('li').eq(this.selectedIndex).addClass('selected')

				// Render first suggestion as inline emote
				this.renderInlineEmote()
				this.scrollSelectedIntoView()
			}
		}
	}

	createModal(containerEl: Node) {
		const $modal = (this.$modal = $(
			`<div class="ntv__tab-completion"><ul class="ntv__tab-completion__list"></ul></div>`
		))

		this.$list = $modal.find('ul')
		$(containerEl).append($modal)

		this.$list.on('click', 'li', e => {
			// Get index of clicked element and update selectedIndex
			this.selectedIndex = $(e.currentTarget).index()
			if (this.mode === 'emote') this.renderInlineEmote()
			else if (this.mode === 'mention') {
				Caret.moveCaretTo(this.node!, this.mentionEnd)
				this.contentEditableEditor.insertText(' ')
			}

			this.hideModal()
			this.reset()
		})
	}

	showModal() {
		if (this.isShowingModal || !this.suggestions.length) return
		if (!this.$modal || !this.$list) return error('Tab completion modal not created')

		const selection = window.getSelection()
		if (selection) {
			const range = selection.getRangeAt(0)
			let startContainer = range.startContainer as HTMLElement | null
			if (startContainer && startContainer.nodeType === Node.TEXT_NODE) {
				startContainer = startContainer.parentElement
			}
		}

		// const rect = startContainer.getBoundingClientRect()
		// this.$modal.css({
		// 	left: rect.left + 'px',
		// 	top: rect.top - 15 + 'px'
		// })

		this.$modal.show()
		this.$list[0].scrollTop = 9999
		this.isShowingModal = true
	}

	hideModal() {
		if (!this.$modal) return error('Tab completion modal not created')
		this.$modal.hide()
		this.isShowingModal = false
	}

	scrollSelectedIntoView() {
		if (!this.$list) return error('Tab completion list not created')

		// Scroll selected element into middle of the list which has max height set and is scrollable
		const $selected = this.$list.find('li.selected')
		const $list = this.$list
		const listHeight = $list.height() || 0
		const selectedTop = $selected.position().top
		const selectedHeight = $selected.height() || 0
		const selectedCenter = selectedTop + selectedHeight / 2
		const middleOfList = listHeight / 2
		const scroll = selectedCenter - middleOfList + ($list.scrollTop() || 0)

		$list.scrollTop(scroll)
	}

	moveSelectorUp() {
		if (this.selectedIndex < this.suggestions.length - 1) {
			this.selectedIndex++
		} else if (this.selectedIndex === this.suggestions.length - 1) {
			this.selectedIndex = 0
		}
		this.$list?.find('li.selected').removeClass('selected')
		this.$list?.find('li').eq(this.selectedIndex).addClass('selected')

		if (this.mode === 'emote') this.renderInlineEmote()
		else if (this.mode === 'mention') {
			this.restoreOriginalText()
			this.renderInlineUserMention()
		}

		this.scrollSelectedIntoView()
	}

	moveSelectorDown() {
		this.$list?.find('li.selected').removeClass('selected')

		if (this.selectedIndex > 0) {
			this.selectedIndex--
		} else {
			this.selectedIndex = this.suggestions.length - 1
		}

		this.$list?.find('li').eq(this.selectedIndex).addClass('selected')

		if (this.mode === 'emote') this.renderInlineEmote()
		else if (this.mode === 'mention') {
			this.restoreOriginalText()
			this.renderInlineUserMention()
		}

		this.scrollSelectedIntoView()
	}

	renderInlineUserMention() {
		const userId = this.suggestionHids[this.selectedIndex]
		if (!userId) return

		const userName = this.suggestions[this.selectedIndex]
		const userMention = `@${userName}`

		if (!this.node) return error('Invalid node to render inline user mention')

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
		const emoteHid = this.suggestionHids[this.selectedIndex]
		if (!emoteHid) return

		if (this.emoteComponent) {
			this.contentEditableEditor.replaceEmote(this.emoteComponent, emoteHid)
		} else {
			if (!this.node) return error('Invalid node to restore original text')
			const range = document.createRange()
			range.setStart(this.node, this.start)
			range.setEnd(this.node, this.end)
			range.deleteContents()
			this.contentEditableEditor.normalize()
			this.emoteComponent = this.contentEditableEditor.insertEmote(emoteHid)
		}
	}

	isClickInsideModal(target: Node) {
		if (!this.$modal) return false
		return this.$modal[0]?.contains(target)
	}

	handleKeydown(evt: KeyboardEvent) {
		if (evt.key === 'Tab') {
			evt.preventDefault()

			if (this.isShowingModal) {
				// Traverse tab completion suggestions up/down depending on whether shift is held with tab
				if (evt.shiftKey) {
					this.moveSelectorDown()
				} else {
					this.moveSelectorUp()
				}
			} else {
				// Show tab completion modal
				this.updateSuggestions()

				if (this.suggestions.length) this.showModal()
				else this.reset()
			}
		} else if (this.isShowingModal) {
			if (evt.key === 'ArrowUp') {
				evt.preventDefault()

				this.moveSelectorUp()
			} else if (evt.key === 'ArrowDown') {
				evt.preventDefault()

				this.moveSelectorDown()
			} else if (evt.key === 'ArrowRight' || evt.key === 'Enter') {
				if (evt.key === 'Enter') {
					evt.preventDefault()
					evt.stopImmediatePropagation()
				}

				if (this.mode === 'mention') this.contentEditableEditor.insertText(' ')

				this.hideModal()
				this.reset()
			} else if (evt.key === ' ') {
				if (this.mode === 'emote') evt.preventDefault()
				this.reset()
			} else if (evt.key === 'ArrowLeft' || evt.key === 'Escape') {
				this.reset()
			} else if (evt.key === 'Backspace') {
				evt.preventDefault()
				evt.stopImmediatePropagation()

				this.restoreOriginalText()
				this.hideModal()
				this.reset()
			} else if (evt.key === 'Shift') {
				// Ignore shift key press
			} else {
				this.hideModal()
				this.reset()
			}
		}
	}

	handleKeyup(evt: KeyboardEvent) {}

	reset() {
		this.mode = ''
		this.suggestions = []
		this.selectedIndex = 0
		this.$list?.empty()
		this.$modal?.hide()
		this.isShowingModal = false
		this.start = 0
		this.end = 0
		this.mentionEnd = 0
		this.node = null
		this.word = null
		this.emoteComponent = null
	}
}
