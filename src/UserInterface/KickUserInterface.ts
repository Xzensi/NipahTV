import { log, info, error, assertArgDefined, waitForElements, cleanupHTML, md5, hex2rgb, logNow } from '../utils'
import { QuickEmotesHolderComponent } from './Components/QuickEmotesHolderComponent'
import { EmoteMenuButtonComponent } from './Components/EmoteMenuButtonComponent'
import { EmoteMenuComponent } from './Components/EmoteMenuComponent'
import { AbstractUserInterface } from './AbstractUserInterface'
import { InputController } from '../Managers/InputController'
import { Clipboard2 } from '../Classes/Clipboard'
import { Caret } from './Caret'

function getEmojiAttributes() {
	return {
		height: '30px',
		width: '30px'
	}
}

export class KickUserInterface extends AbstractUserInterface {
	abortController = new AbortController()

	clipboard = new Clipboard2()
	inputController: InputController | null = null
	chatObserver: MutationObserver | null = null
	pinnedMessageObserver: MutationObserver | null = null
	emoteMenu: EmoteMenuComponent | null = null
	emoteMenuButton: EmoteMenuButtonComponent | null = null
	quickEmotesHolder: QuickEmotesHolderComponent | null = null

	elm: {
		originalTextField: HTMLElement | null
		originalSubmitButton: HTMLElement | null
		chatMessagesContainer: HTMLElement | null
		submitButton: HTMLElement | null
		textField: HTMLElement | null
	} = {
		originalTextField: null,
		originalSubmitButton: null,
		chatMessagesContainer: null,
		submitButton: null,
		textField: null
	}
	stickyScroll = true
	maxMessageLength = 500

	constructor(deps: any) {
		super(deps)
	}

	async loadInterface() {
		info('Creating user interface..')

		const { eventBus, settingsManager, abortController } = this
		const abortSignal = abortController.signal

		this.loadSettings()

		// Wait for text input & submit button to load
		waitForElements(['#message-input', '#chatroom-footer button.base-button'], 5_000, abortSignal)
			.then(() => {
				this.loadShadowProxyElements()
				this.loadEmoteMenu()
				this.loadEmoteMenuButton()

				if (settingsManager.getSetting('shared.chat.appearance.hide_emote_menu_button')) {
					$('#chatroom').addClass('ntv__hide-emote-menu-button')
				}

				if (settingsManager.getSetting('shared.chat.behavior.smooth_scrolling')) {
					$('#chatroom').addClass('ntv__smooth-scrolling')
				}
			})
			.catch(() => {})

		// Wait for quick emotes holder to load
		waitForElements(['#chatroom-footer .quick-emotes-holder'], 5_000, abortSignal)
			.then(() => {
				this.loadQuickEmotesHolder()
			})
			.catch(() => {})

		// Wait for chat messages container to load
		const chatMessagesContainerSelector = this.channelData.is_vod
			? '#chatroom-replay > .overflow-y-scroll > .flex-col-reverse'
			: '#chatroom > div:nth-child(2) > .overflow-y-scroll'

		waitForElements([chatMessagesContainerSelector], 5_000, abortSignal)
			.then(() => {
				this.elm.chatMessagesContainer = document.querySelector(chatMessagesContainerSelector)

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
				eventBus.subscribe('ntv.providers.loaded', this.renderChatMessages.bind(this), true)

				this.observeChatMessages()
				this.loadScrollingBehaviour()
			})
			.catch(() => {})

		waitForElements(['#chatroom-top'], 5_000)
			.then(() => {
				this.observePinnedMessage()
			})
			.catch(() => {})

		// Inject or send emote to chat on emote click
		eventBus.subscribe(
			'ntv.ui.emote.click',
			({ emoteHid, sendImmediately }: { emoteHid: string; sendImmediately?: boolean }) => {
				assertArgDefined(emoteHid)

				if (sendImmediately) {
					this.sendEmoteToChat(emoteHid)
				} else {
					this.inputController?.contentEditableEditor.insertEmote(emoteHid)
				}
			}
		)

		// Submit input to chat
		eventBus.subscribe('ntv.input_controller.submit', this.submitInput.bind(this))

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
		if (!this.elm.textField) return error('Text field not loaded for emote menu')

		const container = this.elm.textField.parentElement!.parentElement!
		this.emoteMenu = new EmoteMenuComponent(
			{ channelData, eventBus, emotesManager, settingsManager },
			container
		).init()

		this.elm.textField.addEventListener('click', this.emoteMenu.toggleShow.bind(this.emoteMenu, false))
	}

	async loadEmoteMenuButton() {
		const { ENV_VARS, eventBus, settingsManager } = this
		this.emoteMenuButton = new EmoteMenuButtonComponent({ ENV_VARS, eventBus, settingsManager }).init()
	}

	async loadQuickEmotesHolder() {
		const { eventBus, settingsManager, emotesManager } = this

		const quickEmotesHolderEnabled = settingsManager.getSetting('shared.chat.quick_emote_holder.enabled')
		if (quickEmotesHolderEnabled) {
			this.quickEmotesHolder = new QuickEmotesHolderComponent({ eventBus, settingsManager, emotesManager }).init()
		}

		eventBus.subscribe(
			'ntv.settings.change.shared.chat.quick_emote_holder.enabled',
			({ value, prevValue }: any) => {
				if (value) {
					this.quickEmotesHolder = new QuickEmotesHolderComponent({
						eventBus,
						settingsManager,
						emotesManager
					}).init()
				} else {
					this.quickEmotesHolder?.destroy()
					this.quickEmotesHolder = null
				}
			}
		)
	}

	loadSettings() {
		const { eventBus, settingsManager } = this

		const firstMessageHighlightColor = settingsManager.getSetting('shared.chat.appearance.highlight_color')
		if (firstMessageHighlightColor) {
			const rgb = hex2rgb(firstMessageHighlightColor)
			document.documentElement.style.setProperty('--color-accent', `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`)
		}

		eventBus.subscribe('ntv.settings.change.shared.chat.appearance.highlight_color', (data: { value: string }) => {
			if (!data.value) return
			const rgb = hex2rgb(data.value)
			document.documentElement.style.setProperty('--color-accent', `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`)
		})
	}

	loadShadowProxyElements() {
		//////////////////////////////////////
		//====// Proxy Submit Button //====//
		const originalSubmitButtonEl = (this.elm.originalSubmitButton = $('#chatroom-footer button.base-button')[0])
		const submitButtonEl = (this.elm.submitButton = $(
			`<button class="ntv__submit-button disabled">Chat</button>`
		)[0])
		originalSubmitButtonEl.after(submitButtonEl)

		///////////////////////////////////
		//====// Proxy Text Field //====//
		const originalTextFieldEl = (this.elm.originalTextField = $('#message-input')[0])
		const placeholder = originalTextFieldEl.dataset.placeholder
		const textFieldEl = (this.elm.textField = $(
			`<div id="ntv__message-input" tabindex="0" contenteditable="true" spellcheck="false" placeholder="${placeholder}"></div>`
		)[0])

		const textFieldWrapperEl = $(
			`<div class="ntv__message-input__wrapper" data-char-limit="${this.maxMessageLength}"></div>`
		)[0]
		textFieldWrapperEl.append(textFieldEl)
		originalTextFieldEl.parentElement!.parentElement?.append(textFieldWrapperEl)

		const $moderatorChatIdentityBadgeIcon = $('.chat-input-wrapper .chat-input-icon')
		if ($moderatorChatIdentityBadgeIcon.length) $(textFieldEl).before($moderatorChatIdentityBadgeIcon)

		////////////////////////////////////////////////
		//====// Proxy Element Event Listeners //====//
		submitButtonEl.addEventListener('click', () => this.submitInput())

		this.inputController = new InputController(this, textFieldEl)
		this.inputController.initialize()
		this.inputController.loadTabCompletionBehaviour(textFieldEl.parentElement!.parentElement!)
		this.inputController.loadChatHistoryBehaviour()

		this.inputController.addEventListener('is_empty', 10, (event: CustomEvent) => {
			if (event.detail.isEmpty) {
				submitButtonEl.setAttribute('disabled', '')
				submitButtonEl.classList.add('disabled')
			} else {
				submitButtonEl.removeAttribute('disabled')
				submitButtonEl.classList.remove('disabled')
			}
		})

		// Redirect focus to proxy text field when original text field is focused.
		originalTextFieldEl.addEventListener('focus', (evt: Event) => {
			evt.preventDefault()
			textFieldEl.focus()
		})

		textFieldEl.addEventListener('cut', evt => {
			this.clipboard.handleCutEvent(evt)
		})

		textFieldEl.addEventListener('copy', evt => {
			this.clipboard.handleCopyEvent(evt)
		})

		this.eventBus.subscribe('ntv.input_controller.character_count', ({ value }: any) => {
			if (value > this.maxMessageLength) {
				textFieldWrapperEl.setAttribute('data-char-count', value)
				textFieldWrapperEl.classList.add('ntv__message-input__wrapper--char-limit-reached')
				textFieldWrapperEl.classList.remove('ntv__message-input__wrapper--char-limit-close')
			} else if (value > this.maxMessageLength * 0.8) {
				textFieldWrapperEl.setAttribute('data-char-count', value)
				textFieldWrapperEl.classList.add('ntv__message-input__wrapper--char-limit-close')
				textFieldWrapperEl.classList.remove('ntv__message-input__wrapper--char-limit-reached')
			} else {
				textFieldWrapperEl.removeAttribute('data-char-count')
				textFieldWrapperEl.classList.remove(
					'ntv__message-input__wrapper--char-limit-reached',
					'ntv__message-input__wrapper--char-limit-close'
				)
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
				this.inputController!.isShowingTabCompletorModal() ||
				ignoredKeys[evt.key] ||
				document.activeElement?.tagName === 'INPUT' ||
				document.activeElement?.getAttribute('contenteditable')
			) {
				return
			}

			textFieldEl.focus()
		})
	}

	loadScrollingBehaviour() {
		const chatMessagesContainerEl = this.elm.chatMessagesContainer
		if (!chatMessagesContainerEl) return error('Chat messages container not loaded for scrolling behaviour')

		// Scroll is sticky by default
		if (this.stickyScroll) chatMessagesContainerEl.parentElement?.classList.add('ntv__sticky-scroll')

		// Enable sticky scroll when user scrolls to bottom
		chatMessagesContainerEl.addEventListener(
			'scroll',
			evt => {
				if (!this.stickyScroll) {
					// Calculate if user has scrolled to bottom and set sticky scroll to true
					const target = evt.target as HTMLElement
					const isAtBottom = (target.scrollHeight || 0) - target.scrollTop <= target.clientHeight + 15

					if (isAtBottom) {
						chatMessagesContainerEl.parentElement?.classList.add('ntv__sticky-scroll')
						target.scrollTop = 99999
						this.stickyScroll = true
					}
				}
			},
			{ passive: true }
		)

		// Disable sticky scroll when user scrolls up
		chatMessagesContainerEl.addEventListener(
			'wheel',
			evt => {
				if (this.stickyScroll && evt.deltaY < 0) {
					chatMessagesContainerEl.parentElement?.classList.remove('ntv__sticky-scroll')
					this.stickyScroll = false
				}
			},
			{ passive: true }
		)
	}

	observeChatMessages() {
		const chatMessagesContainerEl = this.elm.chatMessagesContainer
		if (!chatMessagesContainerEl) return error('Chat messages container not loaded for observing')
		const $chatMessagesContainer = $(chatMessagesContainerEl)

		const scrollToBottom = () => (chatMessagesContainerEl.scrollTop = 99999)

		this.eventBus.subscribe('ntv.providers.loaded', () => {
			// Render emotes in chat when new messages are added
			const observer = (this.chatObserver = new MutationObserver(mutations => {
				mutations.forEach(mutation => {
					if (mutation.addedNodes.length) {
						for (const messageNode of mutation.addedNodes) {
							if (messageNode instanceof HTMLElement) {
								this.renderChatMessage(messageNode)
							}
						}
						if (this.stickyScroll) {
							// We need to wait for the next frame paint call to render before scrolling to bottom
							window.requestAnimationFrame(scrollToBottom)
						}
					}
				})
			}))
			observer.observe(chatMessagesContainerEl, { childList: true })
		})

		// Show emote tooltip with emote name, remove when mouse leaves
		const showTooltips = this.settingsManager.getSetting('shared.chat.tooltips.images')
		$chatMessagesContainer.on('mouseover', '.ntv__inline-emote-box img', evt => {
			const emoteName = evt.target.dataset.emoteName
			const emoteHid = evt.target.dataset.emoteHid
			if (!emoteName || !emoteHid) return

			const target = evt.target
			const $tooltip = $(
				cleanupHTML(`
					<div class="ntv__emote-tooltip__wrapper">
						<div class="ntv__emote-tooltip ${showTooltips ? 'ntv__emote-tooltip--has-image' : ''}">
							${showTooltips ? target.outerHTML.replace('chat-emote', '') : ''}
							<span>${emoteName}</span>
						</div>
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
		$chatMessagesContainer.on('click', '.ntv__inline-emote-box img', evt => {
			const emoteHid = evt.target.getAttribute('data-emote-hid')
			if (emoteHid) this.inputController?.contentEditableEditor.insertEmote(emoteHid)
		})
	}

	observePinnedMessage() {
		const chatroomTopEl = document.getElementById('chatroom-top')
		if (!chatroomTopEl) return error('Chatroom top not loaded for observing pinned message')

		this.eventBus.subscribe('ntv.providers.loaded', () => {
			const observer = (this.pinnedMessageObserver = new MutationObserver(mutations => {
				mutations.forEach(mutation => {
					if (mutation.addedNodes.length) {
						for (const node of mutation.addedNodes) {
							if (node instanceof HTMLElement && node.classList.contains('pinned-message')) {
								this.renderPinnedMessage(node as HTMLElement)
							}
						}
					}
				})
			}))

			observer.observe(chatroomTopEl, { childList: true, subtree: true })

			const pinnedMessage = chatroomTopEl.querySelector('.pinned-message')
			if (pinnedMessage) {
				this.renderPinnedMessage(pinnedMessage as HTMLElement)
			}
		})
	}

	renderChatMessages() {
		if (!this.elm || !this.elm.chatMessagesContainer) return
		const chatMessagesContainerEl = this.elm.chatMessagesContainer
		const chatMessagesContainerNode = chatMessagesContainerEl

		for (const messageNode of chatMessagesContainerNode.children) {
			this.renderChatMessage(messageNode as HTMLElement)
		}
	}

	renderChatMessage(messageNode: HTMLElement) {
		if (!this.channelData.is_vod) {
			const usernameEl = messageNode.querySelector('.chat-entry-username') as HTMLElement
			if (usernameEl) {
				const { chatEntryUser, chatEntryUserId } = usernameEl.dataset
				const chatEntryUserName = usernameEl.textContent
				if (chatEntryUserId && chatEntryUserName) {
					if (!this.usersManager.hasSeenUser(chatEntryUserName)) {
						const enableFirstMessageHighlight = this.settingsManager.getSetting(
							'shared.chat.appearance.highlight_first_message'
						)
						const highlightWhenModeratorOnly = this.settingsManager.getSetting(
							'shared.chat.appearance.highlight_first_message_moderator'
						)
						if (
							enableFirstMessageHighlight &&
							(!highlightWhenModeratorOnly ||
								(highlightWhenModeratorOnly && this.channelData.me.is_moderator))
						) {
							messageNode.classList.add('ntv__highlight-first-message')
						}
					}
					this.usersManager.registerUser(chatEntryUserId, chatEntryUserName)
				}
			}
		}

		/*
		  * Kick chat message structure:
			<div data-chat-entry="...">
				<div class="chat-entry">
					<div></div> <---|| Wrapper for reply message attachment ||
					<div> <---|| Chat message wrapper node ||
						<span class="chat-message-identity">Foobar</span>
						<span class="font-bold text-white">: </span>
						<span> <---|| The content nodes start here ||
							<span class="chat-entry-content"> <---|| Chat message components (text component) ||
								Foobar
							</div>
						</span>
						<span>
							<div class="chat-emote-container"> <---|| Chat message components (emote component) ||
								<div class="relative">
									<img>
								</div>
							</div>
						</span>
					</div>
				</div>
			</div>

		  * We unpack the chat message components and render them in our format:
			<div data-chat-entry="...">
				<div class="chat-entry"> <---|| Can't get rid of this, because Kick hooks into it with buttons ||
					<div class="ntv__chat-message">
						<span class="ntv__chat-message__part">Foobar</span>
						<span class="ntv__chat-message__part ntv__inline-emote-box">
							<img>
						</span>
					</div>
				</div>
			</div>
		*/

		if (messageNode.children && messageNode.children[0]?.classList.contains('chatroom-history-breaker')) return

		const chatEntryNode = messageNode.querySelector('.chat-entry')
		if (!chatEntryNode) {
			// TODO Sometimes Kick decides to just not load messages. Attach another observer to the message to wait for when the message will actually load..
			return error('Message has no content loaded yet..', messageNode)
		}

		let messageWrapperNode

		// Test if message has a reply attached to it
		if (messageNode.querySelector('[title*="Replying to"]')) {
			messageWrapperNode = chatEntryNode.children[1]
		} else {
			messageWrapperNode = chatEntryNode.children[0]
		}

		const contentNodes = Array.from(messageWrapperNode.children)
		const contentNodesLength = contentNodes.length

		// We remove the useless wrapper node because we unpack it's contents to parent
		messageWrapperNode.remove()

		// Find index of first content node after username etc
		let firstContentNodeIndex = 0
		for (let i = 0; i < contentNodes.length; i++) {
			if (contentNodes[i].textContent === ': ') {
				firstContentNodeIndex = i + 1
				break
			}
		}

		// Append username etc nodes to chat entry node
		for (let i = 0; i < firstContentNodeIndex; i++) {
			chatEntryNode.appendChild(contentNodes[i])
		}

		// Chat message after username is empty..
		if (!contentNodes[firstContentNodeIndex]) return

		const emotesManager = this.emotesManager

		// Skip first two nodes, they are the username etc
		for (let i = firstContentNodeIndex; i < contentNodesLength; i++) {
			const contentNode = contentNodes[i]
			const componentNode = contentNode.children[0] // Either text or emote component
			if (!componentNode) {
				// Component node does not exist for:
				// - Removed messages
				// - Kick cosmetic messages like "New Messages-------"
				// - Message replies
				// log('Chat message component node not found. Are chat messages being rendered twice?', contentNode)
				continue
			}

			// We extract and flatten the Kick components to our format
			switch (componentNode.className) {
				case 'chat-entry-content':
					if (!componentNode.textContent) continue
					if (!(componentNode instanceof Element)) {
						error('Chat message content node not an Element?', componentNode)
						continue
					}
					this.renderEmotesInElement(componentNode, chatEntryNode)
					break

				case 'chat-emote-container':
					// Unwrap and clean up native Kick emotes
					const imgEl = componentNode.querySelector('img')
					if (!imgEl) continue

					imgEl.removeAttribute('class')
					for (const attr in imgEl.dataset) {
						if (attr.startsWith('v-')) {
							imgEl.removeAttribute('data-' + attr)
						} else if (attr === 'emoteId') {
							const emoteId = imgEl.getAttribute('data-emote-id')

							if (emoteId) {
								const emote = emotesManager.getEmoteById(emoteId)
								if (!emote) {
									// error('Emote not found', emoteId, imgEl)
									log(
										`Skipping missing emote ${emoteId}, probably subscriber emote of channel you're not subscribed to.`
									)
									continue
								}
								imgEl.setAttribute('data-emote-hid', emote.hid)
								imgEl.setAttribute('data-emote-name', emote.name)
							}
						}
					}

					const newContentNode = document.createElement('span')
					newContentNode.classList.add('ntv__chat-message__part', 'ntv__inline-emote-box')
					newContentNode.setAttribute('contenteditable', 'false')
					newContentNode.appendChild(imgEl)
					chatEntryNode.appendChild(newContentNode)
					break

				default:
					if (componentNode.childNodes.length) chatEntryNode.append(...componentNode.childNodes)
					else error('Unknown chat message component', componentNode)
			}
		}

		if (twemoji)
			twemoji.parse(messageNode, {
				attributes: getEmojiAttributes,
				className: 'ntv__inline-emoji'
				// folder: 'svg',
				// ext: '.svg',
			})

		// Adding this class removes the display: none from the chat message, causing a reflow
		messageNode.classList.add('ntv__chat-message')
	}

	renderPinnedMessage(node: HTMLElement) {
		const chatEntryContentNode = node.querySelector('.chat-entry-content')
		if (!chatEntryContentNode) return error('Pinned message content node not found', node)

		this.renderEmotesInElement(chatEntryContentNode)
	}

	// Submits input to chat
	submitInput(suppressEngagementEvent?: boolean) {
		const { eventBus } = this
		const contentEditableEditor = this.inputController?.contentEditableEditor
		if (!contentEditableEditor) return error('Unable to submit input, the input controller is not loaded yet.')

		if (!this.elm.textField || !this.elm.originalTextField || !this.elm.originalSubmitButton) {
			return error('Text field not loaded for submitting input')
		}

		const originalTextFieldEl = this.elm.originalTextField
		const originalSubmitButtonEl = this.elm.originalSubmitButton
		const textFieldEl = this.elm.textField

		if (contentEditableEditor.getCharacterCount() > this.maxMessageLength) {
			error(
				`Message too long, it is ${contentEditableEditor.getCharacterCount()} characters but max limit is ${
					this.maxMessageLength
				}.`
			)
			return
		}

		originalTextFieldEl.innerHTML = contentEditableEditor.getMessageContent()
		originalSubmitButtonEl.dispatchEvent(new Event('click'))

		eventBus.publish('ntv.ui.input_submitted', { suppressEngagementEvent })
		contentEditableEditor.clearInput()

		// Trigger input event to update submit button disabled state
		textFieldEl.dispatchEvent(new Event('input'))
	}

	// Sends emote to chat and restores previous message
	sendEmoteToChat(emoteHid: string) {
		assertArgDefined(emoteHid)

		if (!this.elm.textField || !this.elm.originalTextField || !this.elm.submitButton) {
			return error('Text field not loaded for sending emote')
		}

		const { inputController } = this
		const contentEditableEditor = inputController?.contentEditableEditor
		if (!contentEditableEditor) return error('Content editable editor not loaded for sending emote')

		const originalTextFieldEl = this.elm.originalTextField
		const originalSubmitButtonEl = this.elm.originalSubmitButton
		if (!originalSubmitButtonEl) return error('Original submit button not loaded for sending emote')

		const oldMessage = contentEditableEditor.getInputHTML()
		contentEditableEditor.clearInput()

		contentEditableEditor.insertEmote(emoteHid)
		originalTextFieldEl.innerHTML = contentEditableEditor.getMessageContent()

		originalTextFieldEl.dispatchEvent(new Event('input'))
		originalSubmitButtonEl.dispatchEvent(new Event('click'))

		this.eventBus.publish('ntv.ui.input_submitted', { suppressEngagementEvent: true })

		contentEditableEditor.setInputContent(oldMessage)

		originalTextFieldEl.innerHTML = oldMessage
		originalTextFieldEl.dispatchEvent(new Event('input'))
	}

	insertNodesInChat(embedNodes: Node[]) {
		if (!embedNodes.length) return error('No nodes to insert in chat')

		const textFieldEl = this.elm.textField
		if (!textFieldEl) return error('Text field not loaded for inserting node')

		const selection = window.getSelection()
		if (selection && selection.rangeCount) {
			const range = selection.getRangeAt(0)
			const caretIsInTextField =
				range.commonAncestorContainer === textFieldEl ||
				range.commonAncestorContainer?.parentElement === textFieldEl

			if (caretIsInTextField) {
				range.deleteContents()
				for (const node of embedNodes) {
					range.insertNode(node)
				}
				selection.collapseToEnd()
			} else {
				textFieldEl.append(...embedNodes)
			}
		} else {
			textFieldEl.append(...embedNodes)
		}

		textFieldEl.normalize()
		textFieldEl.dispatchEvent(new Event('input'))
		textFieldEl.focus()
	}

	insertNodeInChat(embedNode: Node) {
		if (embedNode.nodeType !== Node.TEXT_NODE && embedNode.nodeType !== Node.ELEMENT_NODE) {
			return error('Invalid node type', embedNode)
		}

		const textFieldEl = this.elm.textField
		if (!textFieldEl) return error('Text field not loaded for inserting node')

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
	}

	destroy() {
		if (this.abortController) this.abortController.abort()
		if (this.chatObserver) this.chatObserver.disconnect()
		if (this.pinnedMessageObserver) this.pinnedMessageObserver.disconnect()
		if (this.emoteMenu) this.emoteMenu.destroy()
		if (this.emoteMenuButton) this.emoteMenuButton.destroy()
		if (this.quickEmotesHolder) this.quickEmotesHolder.destroy()
	}
}
