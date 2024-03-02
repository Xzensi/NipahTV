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
			this.loadChatHistoryBehaviour()
			this.loadTabCompletionBehaviour()
		})

		// Wait for quick emotes holder to load
		waitForElements(['#chatroom-footer .quick-emotes-holder']).then(() => {
			this.loadQuickEmotesHolder()
		})

		// Wait for submit button to load
		waitForElements(['#chatroom-footer button.base-button']).then(() => {
			this.loadShadowProxySubmitButton()
			this.loadEmoteMenuButton()

			if (settingsManager.getSetting('shared.chat.appearance.hide_emote_menu_button')) {
				$('#chatroom').addClass('nipah__hide-emote-menu-button')
			}

			if (settingsManager.getSetting('shared.chat.behavior.smooth_scrolling')) {
				$('#chatroom').addClass('nipah__smooth-scrolling')
			}
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
		const container = this.elm.$textField.parent().parent()[0]
		this.emoteMenu = new EmoteMenu({ eventBus, emotesManager, settingsManager }, container).init()

		this.elm.$textField.on('click', this.emoteMenu.toggleShow.bind(this.emoteMenu, false))
	}

	async loadEmoteMenuButton() {
		const { ENV_VARS, eventBus, settingsManager } = this
		this.emoteMenuButton = new EmoteMenuButton({ ENV_VARS, eventBus, settingsManager }).init()
	}

	async loadQuickEmotesHolder() {
		const { eventBus, emotesManager } = this
		this.quickEmotesHolder = new QuickEmotesHolder({ eventBus, emotesManager }).init()
	}

	loadShadowProxySubmitButton() {
		const $originalSubmitButton = (this.elm.$originalSubmitButton = $('#chatroom-footer button.base-button'))
		const $submitButton = (this.elm.$submitButton = $(
			`<button class="nipah__submit-button disabled">Chat</button>`
		))
		$originalSubmitButton.after($submitButton)

		$submitButton.on('click', this.submitInput.bind(this))

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
	}

	loadShadowProxyTextField() {
		const $originalTextField = (this.elm.$originalTextField = $('#message-input'))
		const placeholder = $originalTextField.data('placeholder')
		const $textField = (this.elm.$textField = $(
			`<div id="nipah__message-input" contenteditable="true" spellcheck="false" placeholder="${placeholder}"></div>`
		))
		const originalTextFieldEl = $originalTextField[0]
		const textFieldEl = $textField[0]

		const $textFieldWrapper = $(`<div class="nipah__message-input__wrapper"></div>`)
		$textFieldWrapper.append($textField)
		$originalTextField.parent().parent().append($textFieldWrapper)

		// Shift focus to shadow text field when original text field is focused
		originalTextFieldEl.addEventListener('focus', () => textFieldEl.focus())

		textFieldEl.addEventListener('input', evt => {
			const $submitButton = this.elm.$submitButton
			if (!$submitButton) return

			// Enable/disable submit button based on text field content
			if (textFieldEl.childNodes.length && textFieldEl.childNodes[0]?.tagName !== 'BR') {
				$submitButton.removeClass('disabled')
			} else if (!$submitButton.hasClass('disabled')) {
				$submitButton.addClass('disabled')
			}
		})

		textFieldEl.addEventListener('keydown', evt => {
			if (evt.key === 'Enter' && !this.tabCompletor.isShowingModal) {
				evt.preventDefault()
				this.submitInput()
			}
		})

		textFieldEl.addEventListener('keyup', evt => {
			$originalTextField[0].innerHTML = textFieldEl.innerHTML
			// $originalTextField[0].dispatchEvent(new Event('input')) // This breaks kick emotes for some reason

			// Remove <br> tags from $textField injected by Kick, please stop doing that..
			// const $brTags = $textField.children('br')

			// TODO contenteditable is a nightmare in Firefox, keeps injecting <br> tags
			//  best solution I found yet, is to use ::before to prevent collapse
			//  but now the caret gets placed after the :before pseudo element..
			//  Also bugs in Firefox keep causing the caret to shift outside the text field.
			if (textFieldEl.children.length === 1 && textFieldEl.children[0].tagName === 'BR') {
				textFieldEl.children[0].remove()
				// log('Removed <br> tag from shadow text field')
				// Set caret to before :before pseudo element
				// const range = document.createRange()
				// const selection = window.getSelection()
				// range.setStart(textFieldEl, 0)
				// range.collapse(true)
				// selection.removeAllRanges()
				// selection.addRange(range)

				// document.activeElement.blur()
				// // textFieldEl.focus()
				// setTimeout(() => {
				// 	log('Focusing shadow text field')
				// 	textFieldEl.focus()
				// }, 2000)
				textFieldEl.normalize()
				// document.activeElement.blur()
				// textFieldEl.focus()
			}

			// log('ADASDSDSD', textFieldEl.childNodes, textFieldEl.childNodes.length)
			// if (textFieldEl.childNodes.length === 0) {
			// 	document.activeElement.blur()
			// 	// textFieldEl.focus()
			// 	setTimeout(() => {
			// 		log('Focusing shadow text field')
			// 		textFieldEl.focus()
			// 	}, 2000)
			// }

			// const brTags = textFieldEl.querySelectorAll('br')
			// if (textFieldEl.children.length > 1) {
			// 	log('Removing <br> tags from shadow text field', brTags)
			// 	// $brTags.remove()
			// 	// setTimeout(() => ($brTags[0].innerHTML = $brTags[0].innerHTML.replaceAll('<br>', '')), 1)
			// 	// $brTags[0].innerHTML = ''
			// 	for (const brTag of brTags) {
			// 		brTag.remove()
			// 	}
			// 	// const textNode = document.createTextNode('')
			// 	// log('Appending text node to shadow text field', textNode)
			// 	// textFieldEl.appendChild(textNode)
			// }

			if (evt.keyCode > 47 && evt.keyCode < 112) {
				// Typing any non-whitespace character means you commit to the selected history entry, so we reset the cursor
				this.messageHistory.resetCursor()
			}
		})
	}

	loadChatHistoryBehaviour() {
		const { settingsManager } = this
		if (!settingsManager.getSetting('shared.chat.input.history.enable')) return

		const textFieldEl = this.elm.$textField[0]

		textFieldEl.addEventListener('keydown', evt => {
			if (this.tabCompletor.isShowingModal) return

			if (evt.key === 'ArrowUp' || evt.key === 'ArrowDown') {
				// Check if caret is at the start of the text field
				if (Caret.isCaretAtStartOfNode(textFieldEl) && evt.key === 'ArrowUp') {
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
				} else if (Caret.isCaretAtEndOfNode(textFieldEl) && evt.key === 'ArrowDown') {
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

					Caret.collapseToEndOfNode(textFieldEl)
				}
			}
		})
	}

	loadTabCompletionBehaviour() {
		const $textField = this.elm.$textField
		const textFieldEl = $textField[0]

		const tabCompletor = (this.tabCompletor = new TabCompletor(this.emotesManager))
		tabCompletor.createModal($textField.parent().parent()[0])

		textFieldEl.addEventListener('keydown', evt => {
			if (evt.key === 'Tab') {
				// TODO fix @ name tagging
				// Don't enable tab-completion for @ name tagging
				const { word } = Caret.getWordBeforeCaret()
				if (word && word[0] === '@') return

				evt.preventDefault()

				if (textFieldEl.textContent.trim() === '') return
			}

			tabCompletor.handleKeydown(evt)
		})

		textFieldEl.addEventListener('keyup', evt => {
			if (this.tabCompletor.isShowingModal) {
				if (textFieldEl.textContent.trim() === '' && !textFieldEl.childNodes.length) {
					tabCompletor.reset()
				}
			}
		})

		// Hide tab completion modal when clicking outside of it by calling tabCompletor.reset()
		document.addEventListener('click', evt => {
			const isClickInsideModal = tabCompletor.isClickInsideModal(evt.target)
			if (!isClickInsideModal) {
				tabCompletor.reset()
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
				const emoteId = emotesManager.getEmoteIdByName(token)

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
	submitInput() {
		const { eventBus, emotesManager } = this
		const originalTextFieldEl = this.elm.$originalTextField[0]
		const originalSubmitButtonEl = this.elm.$originalSubmitButton[0]
		const textFieldEl = this.elm.$textField[0]

		// TODO implement max message length checks, take into account emotes and pasting
		//  do emotes count as a single token?

		let parsedString = ''
		for (const node of textFieldEl.childNodes) {
			if (node.nodeType === Node.TEXT_NODE) {
				parsedString += node.textContent
			} else if (node.nodeType === Node.ELEMENT_NODE) {
				const emoteId = node.dataset.emoteId

				if (emoteId) {
					const spacingBefore = parsedString[parsedString.length - 1] !== ' '
					parsedString += emotesManager.getEmoteEmbeddable(emoteId, spacingBefore)
				}
			}
		}

		originalTextFieldEl.innerHTML = parsedString

		this.messageHistory.addMessage(textFieldEl.innerHTML)
		this.messageHistory.resetCursor()

		textFieldEl.innerHTML = ''

		originalSubmitButtonEl.dispatchEvent(new Event('click'))

		// Trigger input event to update submit button disabled state
		textFieldEl.dispatchEvent(new Event('input'))

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

		const emoteEmbedding = emotesManager.getRenderableEmote(emoteId, 'nipah__inline-emote')
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
		this.elm.$submitButton.removeAttr('disabled')

		// Update original text field to match the shadow text field
		this.elm.$originalTextField[0].innerHTML = this.elm.$textField[0].innerHTML
	}

	insertNodeInChat(embedNode) {
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

			Caret.collapseToEndOfNode(embedNode)
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
