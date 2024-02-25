import { EmoteMenuButton } from './Components/EmoteMenuButton'
import { EmoteMenu } from './Components/EmoteMenu'
import { QuickEmotesHolder } from './Components/QuickEmotesHolder'
import { log, info, error, assertArgDefined, waitForElements } from '../utils'
import { AbstractUserInterface } from './AbstractUserInterface'
import { Caret } from './Caret'
import { PLATFORM_ENUM } from '../constants'
import { MessagesHistory } from '../MessagesHistory'

export class KickUserInterface extends AbstractUserInterface {
	elm = {
		$textField: null,
		$submitButton: null,
		$chatMessagesContainer: null
	}
	stickyScroll = true
	messageHistory = new MessagesHistory()

	constructor(deps) {
		super(deps)
	}

	async loadInterface() {
		info('Creating user interface..')
		const { eventBus, settingsManager } = this

		// Wait for text input to load
		waitForElements(['#message-input']).then(() => {
			const $textField = (this.elm.$textField = $('#message-input'))
			$textField.on('input', this.handleInput.bind(this))

			// TODO dirty patch, fix this properly
			// On submit with enter key
			$textField.on('keyup', evt => {
				log('Keydown event', evt.keyCode)
				if (evt.keyCode === 13) {
					this.submitInput()
				}
			})

			$textField.parent()[0].addEventListener('keydown', evt => {
				log('Keydown event2', evt.keyCode)
			})

			this.loadEmoteMenu()
			this.loadQuickEmotesHolder()
			this.loadChatHistoryBehaviour()
		})

		// Wait for submit button to load
		waitForElements(['#chatroom-footer button.base-button']).then(() => {
			const $submitButton = (this.elm.$submitButton = $('#chatroom-footer button.base-button'))
			$submitButton.on('click', this.submitInput.bind(this))

			this.loadEmoteMenuButton()
		})

		// Wait for chat messages container to load
		waitForElements(['#chatroom > div:nth-child(2) > .overflow-y-scroll']).then(() => {
			const $chatMessagesContainer = (this.elm.$chatMessagesContainer = $(
				'#chatroom > div:nth-child(2) > .overflow-y-scroll'
			))

			// Add alternating background color to chat messages
			if (settingsManager.getSetting('shared.chat.appearance.alternating_background')) {
				$('#chatroom').addClass('nipah__alternating-background')
			}

			// Add seperator lines to chat messages
			const seperatorSettingVal = settingsManager.getSetting('shared.chat.appearance.seperators')
			if (seperatorSettingVal && seperatorSettingVal !== 'none') {
				$('#chatroom').addClass(`nipah__seperators-${seperatorSettingVal}`)
			}

			this.observeChatMessages()
			this.loadScrollingBehaviour()
		})

		// Inject or send emote to chat on emote click
		eventBus.subscribe('nipah.ui.emote.click', ({ emoteId, sendImmediately }) => {
			if (sendImmediately) {
				this.sendEmoteToChat(emoteId)
			} else {
				this.insertEmoteInChat(emoteId)
			}
		})

		// Add alternating background color to chat messages
		eventBus.subscribe('nipah.settings.change.shared.chat.appearance.alternating_background', value => {
			$('#chatroom').toggleClass('nipah__alternating-background', value)
		})

		// Add seperator lines to chat messages
		eventBus.subscribe('nipah.settings.change.shared.chat.appearance.seperators', ({ value, prevValue }) => {
			if (prevValue !== 'none') $('#chatroom').removeClass(`nipah__seperators-${prevValue}`)
			if (!value || value === 'none') return
			$('#chatroom').addClass(`nipah__seperators-${value}`)
		})

		// On sigterm signal, cleanup user interface
		eventBus.subscribe('nipah.session.destroy', this.destroy.bind(this))

		// Render emotes in chat when providers are loaded
		eventBus.subscribe('nipah.providers.loaded', this.renderEmotesInChat.bind(this), true)
	}

	async loadEmoteMenu() {
		const { eventBus, settingsManager, emotesManager } = this
		this.emoteMenu = new EmoteMenu({ eventBus, emotesManager, settingsManager }).init()

		this.elm.$textField.on('click', this.emoteMenu.toggleShow.bind(this.emoteMenu, false))
	}

	async loadEmoteMenuButton() {
		const { ENV_VARS, eventBus } = this
		this.emoteMenuButton = new EmoteMenuButton({ ENV_VARS, eventBus }).init()
	}

	async loadQuickEmotesHolder() {
		const { eventBus, emotesManager } = this
		this.quickEmotesHolder = new QuickEmotesHolder({ eventBus, emotesManager }).init()
	}

	loadChatHistoryBehaviour() {
		const $textField = this.elm.$textField

		$textField.on('keydown', evt => {
			if (evt.keyCode === 38 || evt.keyCode === 40) {
				// Check if caret is at the start of the text field
				if (Caret.isCaretAtStartOfNode($textField[0])) {
					log('Caret is at start of text field')
					evt.preventDefault()
					// evt.stopPropagation()
					evt.keyCode === 38 ? this.messageHistory.moveCursorUp() : this.messageHistory.moveCursorDown()

					const message = this.messageHistory.getMessage()
					$textField.html(message)
					log('Message', message)
				}
			}
		})
	}

	loadScrollingBehaviour() {
		const $chatMessagesContainer = this.elm.$chatMessagesContainer

		// Scroll is sticky by default
		if (this.stickyScroll) $chatMessagesContainer.parent().addClass('nipah__sticky-scroll')

		// Enable sticky scroll when user scrolls to bottom
		$chatMessagesContainer[0].addEventListener(
			'scroll',
			evt => {
				if (!this.stickyScroll) {
					// Calculate if user has scrolled to bottom and set sticky scroll to true
					const target = evt.target
					const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 15
					if (isAtBottom) {
						$chatMessagesContainer.parent().addClass('nipah__sticky-scroll')
						target.scrollTop = 99999
						this.stickyScroll = true
					}
				}
			},
			{ passive: true }
		)

		// Disable sticky scroll when user scrolls up
		$chatMessagesContainer[0].addEventListener(
			'wheel',
			evt => {
				if (this.stickyScroll && evt.deltaY < 0) {
					$chatMessagesContainer.parent().removeClass('nipah__sticky-scroll')
					this.stickyScroll = false
				}
			},
			{ passive: true }
		)
	}

	observeChatMessages() {
		const chatMessagesContainerEl = this.elm.$chatMessagesContainer[0]

		const scrollToBottom = () => (chatMessagesContainerEl.scrollTop = 99999)

		const observer = (this.chatObserver = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				if (mutation.addedNodes.length) {
					for (const messageNode of mutation.addedNodes) {
						this.renderEmotesInMessage(messageNode)
					}
					if (this.stickyScroll) {
						// We need to wait for the next frame paint call to render before scrolling to bottom
						window.requestAnimationFrame(scrollToBottom)
					}
				}
			})
		}))

		observer.observe(chatMessagesContainerEl, { childList: true })
	}

	renderEmotesInChat() {
		const chatMessagesContainerEl = this.elm.$chatMessagesContainer[0]
		const chatMessagesContainerNode = chatMessagesContainerEl
		for (const messageNode of chatMessagesContainerNode.children) {
			this.renderEmotesInMessage(messageNode)
		}
	}

	renderEmotesInMessage(messageNode) {
		const { emotesManager } = this
		const messageContentNodes = messageNode.querySelectorAll('.chat-entry-content')

		for (const contentNode of messageContentNodes) {
			const contentNodeText = contentNode.textContent
			const tokens = contentNodeText.split(' ')
			const uniqueTokens = [...new Set(tokens)]
			let innerHTML = contentNode.innerHTML

			for (const token of uniqueTokens) {
				const emoteId = emotesManager.getEmoteIdByProviderName(PLATFORM_ENUM.SEVENTV, token)

				if (emoteId) {
					const emoteRender = emotesManager.getRenderableEmote(emoteId, 'chat-emote')
					innerHTML = innerHTML.replaceAll(
						token,
						`<div class="nipah__emote-box" data-emote-id="${emoteId}">${emoteRender}</div>`
					)
				}
			}
			contentNode.innerHTML = innerHTML
		}
	}

	submitInput(isButtonClickEvent = false) {
		const { eventBus } = this
		const submitButton = this.elm.$submitButton[0]
		const textFieldEl = this.elm.$textField[0]
		const inputVal = textFieldEl.innerHTML

		log('Submitting input', this.elm.$textField, inputVal)
		this.messageHistory.addMessage(inputVal)

		if (!isButtonClickEvent) submitButton.dispatchEvent(new Event('click'))
		eventBus.publish('nipah.ui.submit_input')
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
		if (this.emoteMenu) this.emoteMenu.destroy()
		if (this.emoteMenuButton) this.emoteMenuButton.destroy()
		if (this.quickEmotesHolder) this.quickEmotesHolder.destroy()
		if (this.chatObserver) this.chatObserver.disconnect()
	}
}
