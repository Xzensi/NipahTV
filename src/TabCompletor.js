import { Caret } from './UserInterface/Caret'
import { error, log } from './utils'

export class TabCompletor {
	suggestions = []
	suggestionIds = []
	selectedIndex = 0
	isShowingModal = false

	// Context
	start = 0
	end = 0
	node = null
	word = null
	embedNode = null

	constructor(emotesManager) {
		this.emotesManager = emotesManager
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

		// Get suggestions of emotes
		const searchResults = this.emotesManager.searchEmotes(word.substring(0, 20), 20)
		log('Search results:', searchResults)
		this.suggestions = searchResults.map(result => result.item.name)
		this.suggestionIds = searchResults.map(result => this.emotesManager.getEmoteIdByName(result.item.name))

		this.$list.empty()

		if (this.suggestions.length) {
			for (let i = 0; i < this.suggestions.length; i++) {
				const emoteName = this.suggestions[i]
				const emoteId = this.suggestionIds[i]
				const emoteRender = this.emotesManager.getRenderableEmote(emoteId, 'nipah__emote')
				this.$list.append(`<li data-emote-id="${emoteId}">${emoteRender}<span>${emoteName}</span></li>`)
			}

			this.$list.find('li').eq(this.selectedIndex).addClass('selected')

			// Render first suggestion as inline emote
			this.renderInlineEmote()
			this.scrollSelectedIntoView()
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
			this.renderInlineEmote()

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

		this.renderInlineEmote()
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

		this.renderInlineEmote()
		this.scrollSelectedIntoView()
	}

	renderInlineEmote() {
		const emoteId = this.suggestionIds[this.selectedIndex]
		if (!emoteId) return

		if (this.embedNode) {
			const emoteEmbedding = this.emotesManager.getRenderableEmote('' + emoteId, 'nipah__inline-emote')
			if (!emoteEmbedding) return error('Invalid emote embedding')

			const embedNode = jQuery.parseHTML(emoteEmbedding)[0]
			this.embedNode.after(embedNode)
			this.embedNode.remove()
			this.embedNode = embedNode

			Caret.collapseToEndOfNode(embedNode)
		} else {
			this.insertEmote(emoteId)
		}
	}

	insertEmote(emoteId) {
		const emoteEmbedding = this.emotesManager.getRenderableEmote('' + emoteId, 'nipah__inline-emote')
		if (!emoteEmbedding) return error('Invalid emote embedding')

		const { start, end, node } = this
		if (!node) return error('Invalid node')

		const embedNode = (this.embedNode = jQuery.parseHTML(emoteEmbedding)[0])
		Caret.replaceTextInRange(node, start, end, embedNode)

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
				this.showModal()
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

				// Apply selected tab completion
				const selectedEmoteId = this.suggestionIds[this.selectedIndex]
				if (selectedEmoteId) {
					this.hideModal()
					this.reset()
				}

				this.reset()
			} else if (evt.key === 'ArrowLeft' || evt.key === ' ' || evt.key === 'Escape') {
				this.reset()
			} else if (evt.key === 'Backspace') {
				evt.preventDefault()

				// Restore the original input text
				if (this.word) {
					const textNode = document.createTextNode(this.word)
					this.embedNode.after(textNode)
					this.embedNode.remove()
					Caret.collapseToEndOfNode(textNode)
					const parentEL = textNode.parentElement
					textNode.parentElement.normalize()
				}

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
		this.suggestions = []
		this.selectedIndex = 0
		this.$list.empty()
		this.$modal.hide()
		this.isShowingModal = false
		this.start = 0
		this.end = 0
		this.node = null
		this.word = null
		this.embedNode = null
	}
}
