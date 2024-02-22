import { EmoteMenuButton } from './Components/EmoteMenuButton'
import { EmoteMenu } from './Components/EmoteMenu'
import { QuickEmotesHolder } from './Components/QuickEmotesHolder'
import { log, info, error, assertArgDefined } from '../utils'
import { AbstractUserInterface } from './AbstractUserInterface'
import { Caret } from './Caret'

export class KickUserInterface extends AbstractUserInterface {
	elm = {
		$textField: $('#message-input'),
		$submitButton: $('#chatroom-footer button.base-button')
	}

	constructor(deps) {
		super(deps)
	}

	loadInterface() {
		info('Creating user interface..')
		const { ENV_VARS, eventBus, settingsManager, emotesManager } = this

		const emoteMenu = new EmoteMenu({ eventBus, emotesManager, settingsManager }).init()
		const emoteMenuButton = new EmoteMenuButton({ ENV_VARS, eventBus }).init()
		const quickEmotesHolder = new QuickEmotesHolder({ eventBus, emotesManager }).init()
		this.emoteMenu = emoteMenu
		this.emoteMenuButton = emoteMenuButton
		this.quickEmotesHolder = quickEmotesHolder

		eventBus.subscribe('nipah.ui.emote.click', ({ emoteId, sendImmediately }) => {
			if (sendImmediately) {
				this.sendEmoteToChat(emoteId)
			} else {
				this.insertEmoteInChat(emoteId)
			}
		})

		this.elm.$textField.on('input', this.handleInput.bind(this))
		this.elm.$textField.on('click', emoteMenu.toggleShow.bind(emoteMenu, false))

		// TODO dirt patch, fix this properly
		// On submit with enter key
		this.elm.$textField.on('keyup', evt => {
			if (evt.keyCode === 13) {
				eventBus.publish('nipah.ui.submit_input')
			}
		})

		this.elm.$submitButton.on('click', eventBus.publish.bind(eventBus, 'nipah.ui.submit_input'))

		// Add alternating background to chat messages
		if (settingsManager.getSetting('shared.chat.appearance.alternating_background')) {
			$('#chatroom').addClass('nipah__alternating-background')
		}
		eventBus.subscribe('nipah.settings.change.shared.chat.appearance.alternating_background', value => {
			$('#chatroom').toggleClass('nipah__alternating-background', value)
		})

		// Add seperators to chat messages
		const seperatorSettingVal = settingsManager.getSetting('shared.chat.appearance.seperators')
		if (seperatorSettingVal && seperatorSettingVal !== 'none') {
			$('#chatroom').addClass(`nipah__seperators-${seperatorSettingVal}`)
		}
		eventBus.subscribe('nipah.settings.change.shared.chat.appearance.seperators', ({ value, prevValue }) => {
			if (prevValue !== 'none') $('#chatroom').removeClass(`nipah__seperators-${prevValue}`)
			if (!value || value === 'none') return
			$('#chatroom').addClass(`nipah__seperators-${value}`)
		})
	}

	handleInput(evt) {
		const textFieldEl = this.elm.$textField[0]

		// Remove <br> tags from html that somehow get injected by poor text input implementation of Kick
		if (textFieldEl.innerHTML.includes('<br>')) {
			textFieldEl.innerHTML = textFieldEl.innerHTML.replaceAll('<br>', '')
		}

		// const inputVal = textFieldEl.textContent
	}

	// Sends emote to chat and restores previous message
	sendEmoteToChat(emoteId) {
		assertArgDefined(emoteId)
		const textFieldEl = this.elm.$textField[0]

		const oldMessage = textFieldEl.innerHTML
		textFieldEl.innerHTML = ''
		this.insertEmoteInChat(emoteId)

		textFieldEl.dispatchEvent(new Event('input'))
		this.submitInput()

		textFieldEl.innerHTML = oldMessage
		textFieldEl.dispatchEvent(new Event('input'))
	}

	submitInput() {
		const submitButton = this.elm.$submitButton[0]
		const { eventBus } = this

		submitButton.dispatchEvent(new Event('click'))
		eventBus.publish('nipah.ui.submit_input')
	}

	insertEmoteInChat(emoteId) {
		assertArgDefined(emoteId)
		const { emotesManager } = this

		// Update emotes history when emotes are used
		emotesManager.registerEmoteEngagement(emoteId)

		const emoteEmbedding = emotesManager.getEmoteEmbeddable(emoteId)
		if (!emoteEmbedding) return error('Invalid emote embed')

		let embedNode
		const isEmbedHtml = emoteEmbedding[0] === '<' && emoteEmbedding[emoteEmbedding.length - 1] === '>'
		if (isEmbedHtml) {
			const nodes = jQuery.parseHTML(emoteEmbedding)
			if (!nodes || !nodes.length || nodes.length > 1) return error('Invalid embedding', emoteEmbedding)
			embedNode = nodes[0]
		} else {
			const needPaddingBefore = Caret.hasNonWhitespaceCharacterBeforeCaret()
			const needPaddingAfter = Caret.hasNonWhitespaceCharacterAfterCaret()
			const paddedEmbedding = (needPaddingBefore ? ' ' : '') + emoteEmbedding + (needPaddingAfter ? ' ' : '')
			embedNode = document.createTextNode(paddedEmbedding)
		}

		this.insertNodeInChat(embedNode)
	}

	insertNodeInChat(embedNode) {
		log(`Inserting node in chat`)
		if (embedNode.nodeType !== Node.TEXT_NODE && embedNode.nodeType !== Node.ELEMENT_NODE) {
			return error('Invalid node type', embedNode)
		}

		const textFieldEl = this.elm.$textField[0]

		const selection = window.getSelection()
		const range = selection.anchorNode ? selection.getRangeAt(0) : null

		if (range) {
			const caretIsInTextField =
				range.commonAncestorContainer === textFieldEl ||
				range.commonAncestorContainer?.parentElement === textFieldEl

			if (caretIsInTextField) {
				Caret.insertNodeAtCaret(range, embedNode)
			}

			// Caret is not in text field, just append node to end of text field
			else {
				textFieldEl.appendChild(embedNode)
			}

			Caret.collapseToEndOfNode(selection, range, embedNode)
		}

		// If no range, just append node to end of text field
		else {
			textFieldEl.appendChild(embedNode)
		}

		// Normalize text nodes to merge adjecent text nodes
		textFieldEl.normalize()
		textFieldEl.dispatchEvent(new Event('input'))
		textFieldEl.focus()

		// Manually merge adjecent text nodes
		// let currentMergingTextNode = null
		// for (let i=0; i<textFieldEl.childNodes.length; i++) {
		//     const node = textFieldEl.childNodes[i]
		//     if (node.nodeType === Node.TEXT_NODE) {
		//         if (!currentMergingTextNode) {
		//             currentMergingTextNode = node
		//             continue
		//         }
		//
		//         currentMergingTextNode.textContent += node.textContent
		//         node.remove()
		//         i--;
		//     }
		//     currentMergingTextNode = null
		// }
	}

	destroy() {
		this.emoteMenu.destroy()
		this.emoteMenuButton.destroy()
		this.quickEmotesHolder.destroy()
	}
}
