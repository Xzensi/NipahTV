import { Caret } from './UserInterface/Caret'
import { error, log } from './utils'

export class TabCompletor {
	suggestions = []
	selectedIndex = -1
	isShowingModal = false
	start = 0
	end = 0
	node = null

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
		if (!word) return

		log('Word:', word, start, end, node)

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
		for (let i = 0; i < this.suggestions.length; i++) {
			const emoteName = this.suggestions[i]
			const emoteId = this.suggestionIds[i]
			const emoteRender = this.emotesManager.getRenderableEmote(emoteId, 'nipah__emote')
			this.$list.append(`<li data-emote-id="${emoteId}">${emoteRender}<span>${emoteName}</span></li>`)
		}
	}

	createModal() {
		const $modal = (this.$modal = $(
			`<div class="nipah__tab-suggestions"><ul class="nipah__tab-suggestions__list"></ul></div>`
		))

		this.$list = $modal.find('ul')
		$('body').append($modal)

		this.$list.on('click', 'li', e => {
			const emoteId = $(e.currentTarget).data('emote-id')
			this.insertEmote(emoteId)
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

		const rect = startContainer.getBoundingClientRect()
		this.$modal.css({
			left: rect.left + 'px',
			top: rect.top - 15 + 'px'
		})

		this.$modal.show()
		this.isShowingModal = true
	}

	hideModal() {
		this.$modal.hide()
		this.isShowingModal = false
	}

	moveSelectorDown() {
		this.$list.find('li.selected').removeClass('selected')

		if (this.selectedIndex > 0) {
			this.selectedIndex--
			this.$list.find('li').eq(this.selectedIndex).addClass('selected')
		} else if (this.selectedIndex === 0) {
			// this.selectedIndex = this.suggestions.length - 1
			this.selectedIndex = -1
		}
	}

	moveSelectorUp() {
		if (this.selectedIndex < this.suggestions.length - 1) {
			this.selectedIndex++
		} else if (this.selectedIndex === this.suggestions.length - 1) {
			this.selectedIndex = 0
		}
		this.$list.find('li.selected').removeClass('selected')
		this.$list.find('li').eq(this.selectedIndex).addClass('selected')
	}

	selectEmote() {
		const emoteId = this.suggestionIds[this.selectedIndex]
		this.insertEmote(emoteId)
		this.hideModal()
		this.reset()
	}

	insertEmote(emoteId) {
		const emoteEmbedding = this.emotesManager.getEmoteEmbeddable('' + emoteId)
		if (!emoteEmbedding) return error('Invalid emote embedding')

		const isHTML = emoteEmbedding[0] === '<' && emoteEmbedding[emoteEmbedding.length - 1] === '>'

		const { start, end, node } = this
		if (!node) return error('Invalid node')

		// TODO turn 7tv emotes into element nodes as well
		let embedNode
		if (isHTML) {
			embedNode = jQuery.parseHTML(emoteEmbedding)[0]
		} else {
			embedNode = document.createTextNode(emoteEmbedding)
		}
		Caret.replaceTextInRange(node, start, end, embedNode)

		// const selection = window.getSelection()
		// const range = document.createRange()
		// Caret.collapseToEndOfNode(selection, range, embedNode)

		// Move the caret to the end of the emote
		if (isHTML) {
			const range = document.createRange()
			// range.selectNode(embedNode)
			range.setStartAfter(embedNode)
			range.collapse(true)
			const selection = window.getSelection()
			selection.removeAllRanges()
			selection.addRange(range)
			selection.collapseToEnd()
		} else {
			// We have to use start as startOffset and look for end of the word in the text node
			//  because embedNode got concatenated within the text node
			const newStart = start + emoteEmbedding.length
			const range = document.createRange()
			range.setStart(node, newStart)
			range.setEnd(node, newStart)
			const selection = window.getSelection()
			selection.removeAllRanges()
			selection.addRange(range)
		}
	}

	reset() {
		this.suggestions = []
		this.selectedIndex = -1
		this.$list.empty()
		this.$modal.hide()
		this.isShowingModal = false
		this.start = 0
		this.end = 0
		this.node = null
	}
}
