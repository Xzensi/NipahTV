import { Caret } from '../UserInterface/Caret'
import { error, log } from '../utils'

export class TabCompletor {
	suggestions = []
	suggestionHids = []
	selectedIndex = 0
	isShowingModal = false
	mode = null

	// Context
	start = 0
	end = 0
	mentionEnd = 0
	node = null
	word = null
	embedNode = null

	constructor({ emotesManager, usersManager }) {
		this.emotesManager = emotesManager
		this.usersManager = usersManager
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
			this.suggestions = searchResults.map(result => result.item.name)
			this.suggestionHids = searchResults.map(result => result.item.id)

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
			this.suggestions = searchResults.map(result => result.item.name)
			this.suggestionHids = searchResults.map(result => this.emotesManager.getEmoteHidByName(result.item.name))

			this.$list.empty()

			if (this.suggestions.length) {
				for (let i = 0; i < this.suggestions.length; i++) {
					const emoteName = this.suggestions[i]
					const emoteHid = this.suggestionHids[i]
					const emoteRender = this.emotesManager.getRenderableEmoteByHid(emoteHid, 'nipah__emote')
					this.$list.append(`<li data-emote-hid="${emoteHid}">${emoteRender}<span>${emoteName}</span></li>`)
				}

				this.$list.find('li').eq(this.selectedIndex).addClass('selected')

				// Render first suggestion as inline emote
				this.renderInlineEmote()
				this.scrollSelectedIntoView()
			}
		}
	}

	createModal(containerEl) {
		const $modal = (this.$modal = $(
			`<div class="nipah__tab-completion"><ul class="nipah__tab-completion__list"></ul></div>`
		))

		this.$list = $modal.find('ul')
		$(containerEl).append($modal)

		this.$list.on('click', 'li', e => {
			// Get index of clicked element and update selectedIndex
			this.selectedIndex = $(e.currentTarget).index()
			if (this.mode === 'emote') this.renderInlineEmote()
			else if (this.mode === 'mention') this.renderInlineUserMention()

			this.hideModal()
			this.reset()
		})
	}

	showModal() {
		if (this.isShowingModal || !this.suggestions.length) return

		const selection = window.getSelection()
		const range = selection.getRangeAt(0)
		let startContainer = range.startContainer
		if (startContainer.nodeType === Node.TEXT_NODE) {
			startContainer = startContainer.parentElement
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
		this.$modal.hide()
		this.isShowingModal = false
	}

	scrollSelectedIntoView() {
		// Scroll selected element into middle of the list which has max height set and is scrollable
		const $selected = this.$list.find('li.selected')
		const $list = this.$list
		const listHeight = $list.height()
		const selectedTop = $selected.position().top
		const selectedHeight = $selected.height()
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
		this.$list.find('li.selected').removeClass('selected')
		this.$list.find('li').eq(this.selectedIndex).addClass('selected')

		if (this.mode === 'emote') this.renderInlineEmote()
		else if (this.mode === 'mention') {
			this.restoreOriginalText()
			this.renderInlineUserMention()
		}

		this.scrollSelectedIntoView()
	}

	moveSelectorDown() {
		this.$list.find('li.selected').removeClass('selected')

		if (this.selectedIndex > 0) {
			this.selectedIndex--
		} else {
			this.selectedIndex = this.suggestions.length - 1
		}

		this.$list.find('li').eq(this.selectedIndex).addClass('selected')

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

		this.mentionEnd = Caret.replaceTextInRange(this.node, this.start, this.end, userMention)
		Caret.moveCaretTo(this.node, this.mentionEnd)
	}

	restoreOriginalText() {
		if (this.mode === 'emote' && this.word) {
			const textNode = document.createTextNode(this.word)
			this.embedNode.after(textNode)
			this.embedNode.remove()
			Caret.collapseToEndOfNode(textNode)
			const parentEL = textNode.parentElement
			textNode.parentElement.normalize()
		} else if (this.mode === 'mention') {
			Caret.replaceTextInRange(this.node, this.start, this.mentionEnd, this.word)
			Caret.moveCaretTo(this.node, this.end)
		}
	}

	renderInlineEmote() {
		const emoteHid = this.suggestionHids[this.selectedIndex]
		if (!emoteHid) return

		if (this.embedNode) {
			const emoteEmbedding = this.emotesManager.getRenderableEmoteByHid('' + emoteHid, 'nipah__inline-emote')
			if (!emoteEmbedding) return error('Invalid emote embedding')

			const embedNode = jQuery.parseHTML(emoteEmbedding)[0]
			this.embedNode.after(embedNode)
			this.embedNode.remove()
			this.embedNode = embedNode

			Caret.collapseToEndOfNode(embedNode)
		} else {
			this.insertEmote(emoteHid)
		}
	}

	insertEmote(emoteHid) {
		const emoteEmbedding = this.emotesManager.getRenderableEmoteByHid('' + emoteHid, 'nipah__inline-emote')
		if (!emoteEmbedding) return error('Invalid emote embedding')

		const { start, end, node } = this
		if (!node) return error('Invalid node')

		const embedNode = (this.embedNode = jQuery.parseHTML(emoteEmbedding)[0])
		Caret.replaceTextWithElementInRange(node, start, end, embedNode)

		// Move the caret to the end of the emote
		const range = document.createRange()
		// range.selectNode(embedNode)
		range.setStartAfter(embedNode)
		range.collapse(true)
		const selection = window.getSelection()
		selection.removeAllRanges()
		selection.addRange(range)
		selection.collapseToEnd()
	}

	isClickInsideModal(target) {
		return this.$modal[0]?.contains(target)
	}

	handleKeydown(evt) {
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
				if (evt.key === 'Enter') evt.preventDefault()

				this.hideModal()
				this.reset()
			} else if (evt.key === 'ArrowLeft' || evt.key === ' ' || evt.key === 'Escape') {
				this.reset()
			} else if (evt.key === 'Backspace') {
				evt.preventDefault()

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

	handleKeyup(evt) {}

	reset() {
		this.mode = null
		this.suggestions = []
		this.selectedIndex = 0
		this.$list.empty()
		this.$modal.hide()
		this.isShowingModal = false
		this.start = 0
		this.end = 0
		this.mentionEnd = 0
		this.node = null
		this.word = null
		this.embedNode = null
	}
}
