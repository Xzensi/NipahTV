import { log, info, error, assertArgDefined, waitForElements, cleanupHTML } from '../utils'
import { QuickEmotesHolderComponent } from './Components/QuickEmotesHolderComponent'
import { EmoteMenuButtonComponent } from './Components/EmoteMenuButtonComponent'
import { EmoteMenuComponent } from './Components/EmoteMenuComponent'
import { AbstractUserInterface } from './AbstractUserInterface'
import { TabCompletor } from '../Classes/TabCompletor'
import { Clipboard2 } from '../Classes/Clipboard'
import { Caret } from './Caret'

export class KickUserInterface extends AbstractUserInterface {
	abortController = new AbortController()

	elm: {
		$originalTextField: JQuery<HTMLElement> | null
		$originalSubmitButton: JQuery<HTMLElement> | null
		$chatMessagesContainer: JQuery<HTMLElement> | null
		$submitButton: JQuery<HTMLElement> | null
		$textField: JQuery<HTMLElement> | null
	} = {
		$originalTextField: null,
		$originalSubmitButton: null,
		$chatMessagesContainer: null,
		$submitButton: null,
		$textField: null
	}
	stickyScroll = true
	maxMessageLength = 500

	chatObserver: MutationObserver | null = null
	emoteMenu: EmoteMenuComponent | null = null
	emoteMenuButton: EmoteMenuButtonComponent | null = null
	quickEmotesHolder: QuickEmotesHolderComponent | null = null
	tabCompletor: TabCompletor | null = null

	constructor(deps: any) {
		super(deps)
	}

	async loadInterface() {
		info('Creating user interface..')

		const { eventBus, settingsManager, abortController } = this
		const abortSignal = abortController.signal

		// Wait for text input to load
		waitForElements(['#message-input'], 5_000, abortSignal)
			.then(() => {
				this.loadShadowProxyTextField()

				this.loadEmoteMenu()
				this.loadChatHistoryBehaviour()
				this.loadTabCompletionBehaviour()
			})
			.catch(() => {})

		// Wait for quick emotes holder to load
		waitForElements(['#chatroom-footer .quick-emotes-holder'], 5_000, abortSignal)
			.then(() => {
				this.loadQuickEmotesHolder()
			})
			.catch(() => {})

		// Wait for submit button to load
		waitForElements(['#chatroom-footer button.base-button'], 5_000, abortSignal)
			.then(() => {
				this.loadShadowProxySubmitButton()
				this.loadEmoteMenuButton()

				if (settingsManager.getSetting('shared.chat.appearance.hide_emote_menu_button')) {
					$('#chatroom').addClass('ntv__hide-emote-menu-button')
				}

				if (settingsManager.getSetting('shared.chat.behavior.smooth_scrolling')) {
					$('#chatroom').addClass('ntv__smooth-scrolling')
				}
			})
			.catch(() => {})

		// Wait for chat messages container to load
		waitForElements(['#chatroom > div:nth-child(2) > .overflow-y-scroll'], 5_000, abortSignal)
			.then(() => {
				const $chatMessagesContainer = (this.elm.$chatMessagesContainer = $(
					'#chatroom > div:nth-child(2) > .overflow-y-scroll'
				))

				// Add alternating background color to chat messages
				if (settingsManager.getSetting('shared.chat.appearance.alternating_background')) {
					$('#chatroom').addClass('ntv__alternating-background')
				}

				// Add seperator lines to chat messages
				const seperatorSettingVal = settingsManager.getSetting('shared.chat.appearance.seperators')
				if (seperatorSettingVal && seperatorSettingVal !== 'none') {
					$('#chatroom').addClass(`ntv__seperators-${seperatorSettingVal}`)
				}

				// Render emotes in chat when providers are loaded
				eventBus.subscribe('ntv.providers.loaded', this.renderEmotesInChat.bind(this), true)

				this.observeChatMessages()
				this.loadScrollingBehaviour()
			})
			.catch(() => {})

		// Inject or send emote to chat on emote click
		eventBus.subscribe(
			'ntv.ui.emote.click',
			({ emoteHid, sendImmediately }: { emoteHid: string; sendImmediately?: boolean }) => {
				if (sendImmediately) {
					this.sendEmoteToChat(emoteHid)
				} else {
					this.insertEmoteInChat(emoteHid)
				}
			}
		)

		// Add alternating background color to chat messages
		eventBus.subscribe('ntv.settings.change.shared.chat.appearance.alternating_background', (value: boolean) => {
			$('#chatroom').toggleClass('ntv__alternating-background', value)
		})

		// Add seperator lines to chat messages
		eventBus.subscribe(
			'ntv.settings.change.shared.chat.appearance.seperators',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				if (prevValue !== 'none') $('#chatroom').removeClass(`ntv__seperators-${prevValue}`)
				if (!value || value === 'none') return
				$('#chatroom').addClass(`ntv__seperators-${value}`)
			}
		)

		// On sigterm signal, cleanup user interface
		eventBus.subscribe('ntv.session.destroy', this.destroy.bind(this))
	}

	async loadEmoteMenu() {
		const { channelData, eventBus, settingsManager, emotesManager } = this
		if (!this.elm.$textField) return error('Text field not loaded for emote menu')

		const container = this.elm.$textField.parent().parent()[0]
		this.emoteMenu = new EmoteMenuComponent(
			{ channelData, eventBus, emotesManager, settingsManager },
			container
		).init()

		this.elm.$textField.on('click', this.emoteMenu.toggleShow.bind(this.emoteMenu, false))
	}

	async loadEmoteMenuButton() {
		const { ENV_VARS, eventBus, settingsManager } = this
		this.emoteMenuButton = new EmoteMenuButtonComponent({ ENV_VARS, eventBus, settingsManager }).init()
	}

	async loadQuickEmotesHolder() {
		const { eventBus, settingsManager, emotesManager } = this
		this.quickEmotesHolder = new QuickEmotesHolderComponent({ eventBus, settingsManager, emotesManager }).init()
	}

	loadShadowProxySubmitButton() {
		const $originalSubmitButton = (this.elm.$originalSubmitButton = $('#chatroom-footer button.base-button'))
		const $submitButton = (this.elm.$submitButton = $(`<button class="ntv__submit-button disabled">Chat</button>`))
		$originalSubmitButton.after($submitButton)

		$submitButton.on('click' as any, this.submitInput.bind(this))
	}

	loadShadowProxyTextField() {
		const $originalTextField = (this.elm.$originalTextField = $('#message-input'))
		const placeholder = $originalTextField.data('placeholder')
		const $textField = (this.elm.$textField = $(
			`<div id="ntv__message-input" tabindex="0" contenteditable="true" spellcheck="false" placeholder="${placeholder}"></div>`
		))
		const originalTextFieldEl = $originalTextField[0]
		const textFieldEl = $textField[0]

		const $textFieldWrapper = $(`<div class="ntv__message-input__wrapper"></div>`)
		$textFieldWrapper.append($textField)
		$originalTextField.parent().parent().append($textFieldWrapper)

		// Shift focus to shadow text field when original text field is focused
		originalTextFieldEl.addEventListener('focus', () => textFieldEl.focus(), { passive: true })

		textFieldEl.addEventListener(
			'input',
			evt => {
				const $submitButton = this.elm.$submitButton
				if (!$submitButton) return

				// Enable/disable submit button based on text field content
				if (textFieldEl.children.length && textFieldEl.children[0]?.tagName !== 'BR') {
					$submitButton.removeClass('disabled')
				} else if (!$submitButton.hasClass('disabled')) {
					$submitButton.addClass('disabled')
				}
			},
			{ passive: true }
		)

		textFieldEl.addEventListener('keydown', evt => {
			if (evt.key === 'Enter' && !this.tabCompletor?.isShowingModal) {
				evt.preventDefault()
				this.submitInput()
			}
		})

		textFieldEl.addEventListener(
			'keyup',
			evt => {
				$originalTextField[0].innerHTML = textFieldEl.innerHTML
				// $originalTextField[0].dispatchEvent(new Event('input')) // This breaks kick emotes for some reason

				// Contenteditable is a nightmare in Firefox, keeps injecting <br> tags
				//  best solution I found yet, is to use :before to prevent collapse
				//  but now the caret gets placed after the :before pseudo element..
				//  Also bugs in Firefox keep causing the caret to shift outside the text field.
				if (textFieldEl.children.length === 1 && textFieldEl.children[0].tagName === 'BR') {
					textFieldEl.children[0].remove()
					textFieldEl.normalize()
				}

				if (evt.keyCode > 47 && evt.keyCode < 112) {
					// Typing any non-whitespace character means you commit to the selected history entry, so we reset the cursor
					this.messageHistory.resetCursor()
				}
			},
			{ passive: true }
		)

		const clipboard = new Clipboard2()
		textFieldEl.addEventListener('paste', evt => {
			evt.preventDefault()

			const messageParts = clipboard.parsePastedMessage(evt)
			if (!messageParts || !messageParts.length) return

			for (let i = 0; i < messageParts.length; i++) {
				messageParts[i] = this.renderEmotesInText(messageParts[i])
			}

			clipboard.pasteHTML(messageParts.join(''))

			if (textFieldEl.childNodes.length) {
				this.elm.$submitButton?.removeClass('disabled')
			}
		})

		// Ignore control keys that are not used for typing
		const ignoredKeys: { [key: string]: boolean } = {
			ArrowUp: true,
			ArrowDown: true,
			ArrowLeft: true,
			ArrowRight: true,
			Control: true,
			Shift: true,
			Alt: true,
			Meta: true,
			Home: true,
			End: true,
			PageUp: true,
			PageDown: true,
			Insert: true,
			Delete: true,
			Tab: true,
			Escape: true,
			Enter: true,
			Backspace: true,
			CapsLock: true,
			ContextMenu: true,
			F1: true,
			F2: true,
			F3: true,
			F4: true,
			F5: true,
			F6: true,
			F7: true,
			F8: true,
			F9: true,
			F10: true,
			F11: true,
			F12: true,
			PrintScreen: true,
			ScrollLock: true,
			Pause: true,
			NumLock: true
		}

		// If started typing with focus not on chat input, focus on chat input
		$(document.body).on('keydown', evt => {
			if (
				evt.ctrlKey ||
				evt.altKey ||
				evt.metaKey ||
				this.tabCompletor?.isShowingModal ||
				ignoredKeys[evt.key] ||
				document.activeElement?.tagName === 'INPUT' ||
				document.activeElement?.getAttribute('contenteditable')
			) {
				return
			}

			textFieldEl.focus()
		})
	}

	loadChatHistoryBehaviour() {
		const { settingsManager } = this
		if (!settingsManager.getSetting('shared.chat.input.history.enable')) return

		const $textField = this.elm.$textField
		if (!$textField) return error('Text field not loaded for chat history')

		const textFieldEl = $textField[0]

		textFieldEl.addEventListener('keydown', evt => {
			if (this.tabCompletor?.isShowingModal) return

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
				}
			}
		})
	}

	loadTabCompletionBehaviour() {
		const { emotesManager, usersManager } = this

		const $textField = this.elm.$textField
		if (!$textField) return error('Text field not loaded for chat history')
		const textFieldEl = $textField[0]

		const tabCompletor = (this.tabCompletor = new TabCompletor({ emotesManager, usersManager }))
		tabCompletor.createModal($textField.parent().parent()[0])

		textFieldEl.addEventListener('keydown', tabCompletor.handleKeydown.bind(tabCompletor))

		textFieldEl.addEventListener('keyup', evt => {
			if (this.tabCompletor?.isShowingModal) {
				if (
					(!textFieldEl.textContent || textFieldEl.textContent.trim() === '') &&
					!textFieldEl.childNodes.length
				) {
					tabCompletor.reset()
				}
			}
		})

		// Hide tab completion modal when clicking outside of it by calling tabCompletor.reset()
		document.addEventListener('click', evt => {
			if (!evt.target) return
			const isClickInsideModal = tabCompletor.isClickInsideModal(evt.target as Node)
			if (!isClickInsideModal) tabCompletor.reset()
		})
	}

	loadScrollingBehaviour() {
		const $chatMessagesContainer = this.elm.$chatMessagesContainer
		if (!$chatMessagesContainer) return error('Chat messages container not loaded for scrolling behaviour')

		// Scroll is sticky by default
		if (this.stickyScroll) $chatMessagesContainer.parent().addClass('ntv__sticky-scroll')

		// Enable sticky scroll when user scrolls to bottom
		$chatMessagesContainer[0].addEventListener(
			'scroll',
			evt => {
				if (!this.stickyScroll) {
					// Calculate if user has scrolled to bottom and set sticky scroll to true
					const target = evt.target as HTMLElement
					const isAtBottom = (target.scrollHeight || 0) - target.scrollTop <= target.clientHeight + 15

					if (isAtBottom) {
						$chatMessagesContainer.parent().addClass('ntv__sticky-scroll')
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
					$chatMessagesContainer.parent().removeClass('ntv__sticky-scroll')
					this.stickyScroll = false
				}
			},
			{ passive: true }
		)
	}

	observeChatMessages() {
		const $chatMessagesContainer = this.elm.$chatMessagesContainer
		if (!$chatMessagesContainer) return error('Chat messages container not loaded for observing')
		const chatMessagesContainerEl = $chatMessagesContainer[0]

		const scrollToBottom = () => (chatMessagesContainerEl.scrollTop = 99999)

		// Render emotes in chat when new messages are added
		const observer = (this.chatObserver = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				if (mutation.addedNodes.length) {
					for (const messageNode of mutation.addedNodes) {
						if (messageNode.nodeType !== Node.ELEMENT_NODE) continue
						this.renderEmotesInMessage(messageNode as HTMLElement)
					}
					if (this.stickyScroll) {
						// We need to wait for the next frame paint call to render before scrolling to bottom
						window.requestAnimationFrame(scrollToBottom)
					}
				}
			})
		}))

		observer.observe(chatMessagesContainerEl, { childList: true })

		// Show emote tooltip with emote name, remove when mouse leaves
		const showTooltips = this.settingsManager.getSetting('shared.chat.tooltips.images')
		$chatMessagesContainer.on('mouseover', '.ntv__emote-box img', evt => {
			const emoteName = evt.target.dataset.emoteName
			const emoteHid = evt.target.dataset.emoteHid
			if (!emoteName || !emoteHid) return

			const target = evt.target
			const $tooltip = $(
				cleanupHTML(`
					<div class="ntv__emote-tooltip ${showTooltips ? 'ntv__emote-tooltip--has-image' : ''}">
						${showTooltips ? target.outerHTML.replace('chat-emote', '') : ''}
						<span>${emoteName}</span>
					</div>`)
			)

			$(target).after($tooltip)

			evt.target.addEventListener(
				'mouseleave',
				() => {
					$tooltip.remove()
				},
				{ once: true, passive: true }
			)
		})

		// Insert emote in chat input when clicked
		// Can't track click events on kick emotes, because they kill the even with stopPropagation()
		$chatMessagesContainer.on('click', '.ntv__emote-box img', evt => {
			const emoteHid = evt.target.dataset.emoteHid
			if (!emoteHid) return
			this.insertEmoteInChat(emoteHid)
		})
	}

	renderEmotesInChat() {
		if (!this.elm || !this.elm.$chatMessagesContainer) return
		const chatMessagesContainerEl = this.elm.$chatMessagesContainer[0]
		const chatMessagesContainerNode = chatMessagesContainerEl

		for (const messageNode of chatMessagesContainerNode.children) {
			this.renderEmotesInMessage(messageNode as HTMLElement)
		}
	}

	renderEmotesInMessage(messageNode: HTMLElement) {
		const usernameEl = messageNode.querySelector('.chat-entry-username') as HTMLElement
		if (usernameEl) {
			const { chatEntryUser, chatEntryUserId } = usernameEl.dataset
			const chatEntryUserName = usernameEl.textContent
			if (chatEntryUserId && chatEntryUserName) {
				this.usersManager.registerUser(chatEntryUserId, chatEntryUserName)
			}
		}

		const messageContentNodes = messageNode.querySelectorAll('.chat-entry-content')
		for (const contentNode of messageContentNodes) {
			if (!contentNode.textContent) continue
			contentNode.innerHTML = this.renderEmotesInText(contentNode.textContent)
		}
	}

	// Submits input to chat
	submitInput(suppressEngagementEvent = false) {
		const { eventBus, emotesManager } = this

		if (!this.elm.$textField || !this.elm.$originalTextField || !this.elm.$originalSubmitButton) {
			return error('Text field not loaded for submitting input')
		}

		const originalTextFieldEl = this.elm.$originalTextField[0]
		const originalSubmitButtonEl = this.elm.$originalSubmitButton[0]
		const textFieldEl = this.elm.$textField[0]

		let parsedString = ''
		let emotesInMessage = new Set()
		for (const node of textFieldEl.childNodes) {
			if (node.nodeType === Node.TEXT_NODE) {
				parsedString += node.textContent
			} else if (node.nodeType === Node.ELEMENT_NODE) {
				const emoteHid = (node as HTMLElement).dataset.emoteHid

				if (emoteHid) {
					emotesInMessage.add(emoteHid)
					const spacingBefore = parsedString[parsedString.length - 1] !== ' '
					parsedString += emotesManager.getEmoteEmbeddable(emoteHid, spacingBefore)
				}
			}
		}

		if (parsedString.length > this.maxMessageLength) {
			error(
				`Message too long, it is ${parsedString.length} characters but max limit is ${this.maxMessageLength}.`
			)
			return
		}

		if (!suppressEngagementEvent) {
			for (const emoteHid of emotesInMessage) {
				emotesManager.registerEmoteEngagement(emoteHid as string)
			}
		}

		originalTextFieldEl.innerHTML = parsedString

		this.messageHistory.addMessage(textFieldEl.innerHTML)
		this.messageHistory.resetCursor()

		textFieldEl.innerHTML = ''

		originalSubmitButtonEl.dispatchEvent(new Event('click'))

		// Trigger input event to update submit button disabled state
		textFieldEl.dispatchEvent(new Event('input'))

		eventBus.publish('ntv.ui.submit_input')
	}

	// Sends emote to chat and restores previous message
	sendEmoteToChat(emoteHid: string) {
		assertArgDefined(emoteHid)

		if (!this.elm.$textField || !this.elm.$originalTextField || !this.elm.$submitButton) {
			return error('Text field not loaded for sending emote')
		}

		const originalTextFieldEl = this.elm.$originalTextField[0]
		const textFieldEl = this.elm.$textField[0]

		const oldMessage = textFieldEl.innerHTML
		textFieldEl.innerHTML = ''

		this.insertEmoteInChat(emoteHid)
		this.submitInput(true)

		textFieldEl.innerHTML = oldMessage
		originalTextFieldEl.innerHTML = oldMessage
		originalTextFieldEl.dispatchEvent(new Event('input'))

		if (oldMessage) {
			this.elm.$submitButton.removeAttr('disabled')
		}
	}

	insertEmoteInChat(emoteHid: string) {
		assertArgDefined(emoteHid)
		const { emotesManager } = this

		// Inserting emote means you chose the history entry, so we reset the cursor
		this.messageHistory.resetCursor()

		const emoteEmbedding = emotesManager.getRenderableEmoteByHid(emoteHid, 'ntv__inline-emote')
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
		this.elm.$submitButton?.removeAttr('disabled')

		// Update original text field to match the shadow text field
		if (!this.elm.$originalTextField) return error('Original text field not loaded for emote insertion')
		this.elm.$originalTextField.html(this.elm.$textField?.html() || '')
	}

	insertNodeInChat(embedNode: Node) {
		if (embedNode.nodeType !== Node.TEXT_NODE && embedNode.nodeType !== Node.ELEMENT_NODE) {
			return error('Invalid node type', embedNode)
		}

		const $textField = this.elm.$textField
		if (!$textField) return error('Text field not loaded for inserting node')
		const textFieldEl = $textField[0]

		const selection = window.getSelection()
		const range = selection?.anchorNode ? selection.getRangeAt(0) : null

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
		if (this.abortController) this.abortController.abort()
		if (this.chatObserver) this.chatObserver.disconnect()
		if (this.emoteMenu) this.emoteMenu.destroy()
		if (this.emoteMenuButton) this.emoteMenuButton.destroy()
		if (this.quickEmotesHolder) this.quickEmotesHolder.destroy()
	}
}