import { EmoteMenuButton } from './Components/EmoteMenuButton'
import { EmoteMenu } from './Components/EmoteMenu'
import { QuickEmotesHolder } from './Components/QuickEmotesHolder'
import { log, info, error, assertArgDefined, waitForElements } from '../utils'
import { AbstractUserInterface } from './AbstractUserInterface'
import { Caret } from './Caret'
import { PROVIDER_ENUM } from '../constants'
import { MessagesHistory } from '../MessagesHistory'
import { TabCompletor } from '../TabCompletor'

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
			this.loadShadowProxyTextField()

			this.loadEmoteMenu()
			this.loadQuickEmotesHolder()
			this.loadChatHistoryBehaviour()
			this.loadTabCompletionBehaviour()
		})

		// Wait for submit button to load
		waitForElements(['#chatroom-footer button.base-button']).then(() => {
			const $submitButton = (this.elm.$submitButton = $('#chatroom-footer button.base-button'))
			$submitButton.on('click', this.submitInput.bind(this, true))

			this.loadEmoteMenuButton()

			// TODO quick fix for submit button being disabled when text field is not empty
			const observer = new MutationObserver(mutations => {
				if (!this.elm || !this.elm.$textField) return

				// Disconnect the observer temporarily to avoid recursive loops
				observer.disconnect()

				if (!this.elm.$textField[0].innerHTML) {
					$submitButton.attr('disabled', true)
				} else {
					$submitButton.removeAttr('disabled')
				}

				observer.observe($submitButton[0], {
					attributes: true,
					attributeFilter: ['disabled']
				})
			})

			observer.observe($submitButton[0], {
				attributes: true,
				attributeFilter: ['disabled']
			})
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

	loadShadowProxyTextField() {
		const $originalTextField = (this.elm.$originalTextField = $('#message-input'))
		const placeholder = $originalTextField.data('placeholder')
		const $textField = (this.elm.$textField = $(
			`<div id="nipah__message-input" contenteditable="true" data-placeholder="${placeholder}"></div>`
		))
		const textFieldEl = $textField[0]
		$originalTextField.after(textFieldEl)

		textFieldEl.addEventListener('keydown', evt => {
			if (evt.key === 'Enter' && !this.tabCompletor.isShowingModal) {
				evt.preventDefault()
				this.submitInput()
			}
		})

		textFieldEl.addEventListener('keyup', evt => {
			$originalTextField[0].innerHTML = textFieldEl.innerHTML
			$originalTextField[0].dispatchEvent(new Event('input'))

			if (evt.keyCode > 47 && evt.keyCode < 112) {
				// Typing any non-whitespace character means you commit to the selected history entry, so we reset the cursor
				this.messageHistory.resetCursor()
			}
		})
	}

	loadChatHistoryBehaviour() {
		const originalTextFieldEl = this.elm.$originalTextField[0]
		const textFieldEl = this.elm.$textField[0]

		textFieldEl.addEventListener('keydown', evt => {
			if (this.tabCompletor.isShowingModal) return

			if (evt.keyCode === 38 || evt.keyCode === 40) {
				// TODO there's a bug where caret is at start but requires 2 key presses to traverse history
				// Check if caret is at the start of the text field
				if (Caret.isCaretAtStartOfNode(textFieldEl) && evt.keyCode === 38) {
					evt.preventDefault()

					if (!this.messageHistory.canMoveCursor(1)) return

					// Store leftover html in case history traversal was accidental
					const leftoverHTML = textFieldEl.innerHTML
					if (this.messageHistory.isCursorAtStart() && leftoverHTML) {
						this.messageHistory.addMessage(leftoverHTML)
						this.messageHistory.moveCursor(2)
					} else {
						this.messageHistory.moveCursor(1)
					}

					textFieldEl.innerHTML = this.messageHistory.getMessage()
				} else if (Caret.isCaretAtEndOfNode(textFieldEl) && evt.keyCode === 40) {
					evt.preventDefault()

					// Reached most recent message traversing down history
					if (this.messageHistory.canMoveCursor(-1)) {
						this.messageHistory.moveCursor(-1)
						textFieldEl.innerHTML = this.messageHistory.getMessage()
					} else {
						// Store leftover html in case history traversal was accidental
						const leftoverHTML = textFieldEl.innerHTML
						if (leftoverHTML) this.messageHistory.addMessage(leftoverHTML)

						// Moved past most recent message, empty text field
						this.messageHistory.resetCursor()
						textFieldEl.innerHTML = ''
					}
				}
			}
		})
	}

	loadTabCompletionBehaviour() {
		const textFieldEl = this.elm.$textField[0]

		const tabCompletor = (this.tabCompletor = new TabCompletor(this.emotesManager))
		tabCompletor.createModal()

		textFieldEl.addEventListener('keydown', evt => {
			if (evt.key === 'Tab') {
				evt.preventDefault()

				if (textFieldEl.textContent.trim() === '') return

				if (this.tabCompletor.isShowingModal) {
					// Traverse tab completion suggestions up/down depending on whether shift is held with tab
					if (evt.shiftKey) {
						tabCompletor.moveSelectorDown()
					} else {
						tabCompletor.moveSelectorUp()
					}
				} else {
					// Show tab completion popup
					tabCompletor.updateSuggestions()
					tabCompletor.showModal()
				}
			} else if (this.tabCompletor.isShowingModal) {
				if (evt.key === 'ArrowUp' || evt.key === 'ArrowDown') {
					evt.preventDefault()

					if (evt.key === 'ArrowUp') {
						tabCompletor.moveSelectorUp()
					} else {
						tabCompletor.moveSelectorDown()
					}
				} else if (evt.key === 'ArrowRight' || evt.key === 'Enter') {
					evt.preventDefault()

					// Apply selected tab completion
					const selectedEmoteId = tabCompletor.getSelectedSuggestionEmoteId()
					if (selectedEmoteId) {
						this.tabCompletor.selectEmote()
					}

					tabCompletor.reset()
				} else if (evt.key === 'ArrowLeft') {
					evt.preventDefault()

					tabCompletor.reset()
				} else if (evt.key === ' ' || evt.key === 'Escape') {
					tabCompletor.reset()
				} else {
					tabCompletor.updateSuggestions()
				}
			}
		})

		textFieldEl.addEventListener('keyup', evt => {
			if (this.tabCompletor.isShowingModal) {
				if (textFieldEl.textContent.trim() === '' || !textFieldEl.childNodes.length) {
					tabCompletor.reset()
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
		if (!this.elm || !this.elm.$chatMessagesContainer) return
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
				const emoteId = emotesManager.getEmoteIdByProviderName(PROVIDER_ENUM.SEVENTV, token)

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

	// Submits input to chat
	submitInput(isButtonClickEvent = false) {
		const { eventBus } = this
		const originalTextFieldEl = this.elm.$originalTextField[0]
		const submitButtonEl = this.elm.$submitButton[0]
		const textFieldEl = this.elm.$textField[0]

		const inputHTML = textFieldEl.innerHTML
		originalTextFieldEl.innerHTML = inputHTML

		// TODO implement max message length checks, take into account emotes and pasting
		//  do emotes count as a single token?
		textFieldEl.innerHTML = ''

		this.messageHistory.addMessage(inputHTML)
		this.messageHistory.resetCursor()

		// Don't submit if this function was called by submit button click to prevent infinite recursion
		if (!isButtonClickEvent) submitButtonEl.dispatchEvent(new Event('click'))
		eventBus.publish('nipah.ui.submit_input')
	}

	// Sends emote to chat and restores previous message
	sendEmoteToChat(emoteId) {
		assertArgDefined(emoteId)

		const originalTextFieldEl = this.elm.$originalTextField[0]
		const textFieldEl = this.elm.$textField[0]

		const oldMessage = textFieldEl.innerHTML
		textFieldEl.innerHTML = ''

		this.insertEmoteInChat(emoteId)
		this.submitInput()

		textFieldEl.innerHTML = oldMessage
		originalTextFieldEl.innerHTML = oldMessage
		originalTextFieldEl.dispatchEvent(new Event('input'))

		// TODO fix this, need to wait till message is sent before re-enabling submit button or Kick will override it

		if (oldMessage) {
			this.elm.$submitButton.removeAttr('disabled')
			// 	window.requestAnimationFrame(() => {
			// 		this.elm.$submitButton.removeAttr('disabled')
			// 	})
			// 	setTimeout(() => {
			// 		this.elm.$submitButton.removeAttr('disabled')
			// 	}, 1000)
		}
	}

	insertEmoteInChat(emoteId) {
		assertArgDefined(emoteId)
		const { emotesManager } = this

		// Inserting emote means you chose the history entry, so we reset the cursor
		this.messageHistory.resetCursor()

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
