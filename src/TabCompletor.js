import { Caret } from './UserInterface/Caret'
import { error, log } from './utils'

export class TabCompletor {
	suggestions = []
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

	getSelectedSuggestionEmoteId() {
		if (this.selectedIndex === -1) return null
		return this.emotesManager.getEmoteIdByName(this.suggestions[this.selectedIndex])
	}

	updateSuggestions() {
		// TODO implement automatic cancelling of processing to prevent UI lag and hangups
		//  Maybe use a web worker for this

		// Get word before caret
		const { word, start, end, node } = Caret.getWordBeforeCaret()
		log('Word:', word, start, end, node)
		if (!word) return

		this.word = word
		this.start = start
		this.end = end
		this.node = node

		// TODO implement smarter search function that splits the emote names into multiple parts
		// Get suggestions of emotes
		const searchResults = this.emotesManager.search(word, 6)
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

	moveSelectorUp() {
		if (this.selectedIndex < this.suggestions.length - 1) {
			this.selectedIndex++
		} else if (this.selectedIndex === this.suggestions.length - 1) {
			this.selectedIndex = 0
		}
		this.$list.find('li.selected').removeClass('selected')
		this.$list.find('li').eq(this.selectedIndex).addClass('selected')

		this.renderInlineEmote()
	}

	moveSelectorDown() {
		this.$list.find('li.selected').removeClass('selected')

		if (this.selectedIndex > 0) {
			this.selectedIndex--
			this.$list.find('li').eq(this.selectedIndex).addClass('selected')
		} else if (this.selectedIndex === 0) {
			// this.selectedIndex = this.suggestions.length - 1
			this.selectedIndex = 0
		}

		this.renderInlineEmote()
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
				const selectedEmoteId = this.getSelectedSuggestionEmoteId()
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
					log(parentEL.childNodes)
					textNode.parentElement.normalize()
					log(parentEL.childNodes)
				}

				this.hideModal()
				this.reset()
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
