import {
	log,
	info,
	error,
	assertArgDefined,
	waitForElements,
	cleanupHTML,
	md5,
	hex2rgb,
	logNow,
	parseHTML
} from '../utils'
import { QuickEmotesHolderComponent } from './Components/QuickEmotesHolderComponent'
import { EmoteMenuButtonComponent } from './Components/EmoteMenuButtonComponent'
import { EmoteMenuComponent } from './Components/EmoteMenuComponent'
import { AbstractUserInterface } from './AbstractUserInterface'
import { Caret } from './Caret'
import { InputController } from '../Managers/InputController'

function getEmojiAttributes() {
	return {
		height: '30px',
		width: '30px'
	}
}

export class KickUserInterface extends AbstractUserInterface {
	private abortController = new AbortController()

	private chatObserver: MutationObserver | null = null
	private replyObserver: MutationObserver | null = null
	private pinnedMessageObserver: MutationObserver | null = null
	private emoteMenu: EmoteMenuComponent | null = null
	private emoteMenuButton: EmoteMenuButtonComponent | null = null
	private quickEmotesHolder: QuickEmotesHolderComponent | null = null

	protected elm: {
		originalTextField: HTMLElement | null
		originalSubmitButton: HTMLElement | null
		chatMessagesContainer: HTMLElement | null
		replyMessageWrapper: HTMLElement | null
		submitButton: HTMLElement | null
		textField: HTMLElement | null
	} = {
		originalTextField: null,
		originalSubmitButton: null,
		chatMessagesContainer: null,
		replyMessageWrapper: null,
		submitButton: null,
		textField: null
	}

	private stickyScroll = true
	protected maxMessageLength = 500

	constructor(deps: any) {
		super(deps)
	}

	async loadInterface() {
		info('Creating user interface..')

		super.loadInterface()

		const { eventBus, settingsManager, abortController } = this
		const abortSignal = abortController.signal

		this.loadSettings()

		// Wait for text input & submit button to load
		waitForElements(['#message-input', '#chatroom-footer button.base-button'], 5_000, abortSignal)
			.then(() => {
				this.loadShadowProxyElements()
				this.loadEmoteMenu()
				this.loadEmoteMenuButton()
				this.loadQuickEmotesHolder()

				if (settingsManager.getSetting('shared.chat.appearance.hide_emote_menu_button')) {
					document.getElementById('chatroom')?.classList.add('ntv__hide-emote-menu-button')
				}

				if (settingsManager.getSetting('shared.chat.behavior.smooth_scrolling')) {
					document.getElementById('chatroom')?.classList.add('ntv__smooth-scrolling')
				}
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
					document.getElementById('chatroom')?.classList.add('ntv__alternating-background')
				}

				// Add seperator lines to chat messages
				const seperatorSettingVal = settingsManager.getSetting('shared.chat.appearance.seperators')
				if (seperatorSettingVal && seperatorSettingVal !== 'none') {
					document.getElementById('chatroom')?.classList.add(`ntv__seperators-${seperatorSettingVal}`)
				}

				// Render emotes in chat when providers are loaded
				eventBus.subscribe('ntv.providers.loaded', this.renderChatMessages.bind(this), true)

				this.observeChatMessages()
				this.loadScrollingBehaviour()
				this.loadReplyBehaviour()
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
			document.getElementById('chatroom')?.classList.toggle('ntv__alternating-background', value)
		})

		// Add seperator lines to chat messages
		eventBus.subscribe(
			'ntv.settings.change.shared.chat.appearance.seperators',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				if (prevValue !== 'none')
					document.getElementById('chatroom')?.classList.remove(`ntv__seperators-${prevValue}`)
				if (!value || value === 'none') return
				document.getElementById('chatroom')?.classList.add(`ntv__seperators-${value}`)
			}
		)

		// On sigterm signal, cleanup user interface
		eventBus.subscribe('ntv.session.destroy', this.destroy.bind(this))
	}

	// TODO move methods like this to super class. this.elm.textfield event can be in contentEditableEditor
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
			const placeholder = document.createElement('div')
			document.querySelector('#chatroom-footer .chat-mode')?.parentElement?.prepend(placeholder)
			this.quickEmotesHolder = new QuickEmotesHolderComponent(
				{ eventBus, settingsManager, emotesManager },
				placeholder
			).init()
		}

		eventBus.subscribe(
			'ntv.settings.change.shared.chat.quick_emote_holder.enabled',
			({ value, prevValue }: any) => {
				if (value) {
					const placeholder = document.createElement('div')
					document.querySelector('#chatroom-footer .chat-mode')?.parentElement?.prepend(placeholder)
					this.quickEmotesHolder = new QuickEmotesHolderComponent(
						{
							eventBus,
							settingsManager,
							emotesManager
						},
						placeholder
					).init()
				} else {
					this.quickEmotesHolder?.destroy()
					this.quickEmotesHolder = null
				}
			}
		)

		// Wait for native quick emotes holder to load and remove it
		waitForElements(['#chatroom-footer .quick-emotes-holder'], 7_000, this.abortController.signal)
			.then(() => {
				document.querySelector('#chatroom-footer .quick-emotes-holder')?.remove()
			})
			.catch(() => {})
	}

	loadSettings() {
		const { eventBus, settingsManager } = this

		const firstMessageHighlightColor = settingsManager.getSetting('shared.chat.appearance.highlight_color')
		if (firstMessageHighlightColor) {
			const rgb = hex2rgb(firstMessageHighlightColor)
			document.documentElement.style.setProperty('--ntv-color-accent', `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`)
		}

		eventBus.subscribe('ntv.settings.change.shared.chat.appearance.highlight_color', (data: { value: string }) => {
			if (!data.value) return
			const rgb = hex2rgb(data.value)
			document.documentElement.style.setProperty('--ntv-color-accent', `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`)
		})
	}

	loadShadowProxyElements() {
		if (!this.channelData.me.is_logged_in) return

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

		document.getElementById('chatroom')?.classList.add('ntv__hide-chat-input')

		////////////////////////////////////////////////
		//====// Proxy Element Event Listeners //====//
		submitButtonEl.addEventListener('click', () => this.submitInput())

		const inputController = (this.inputController = new InputController(
			{
				settingsManager: this.settingsManager,
				eventBus: this.eventBus,
				networkInterface: this.networkInterface,
				emotesManager: this.emotesManager,
				usersManager: this.usersManager,
				clipboard: this.clipboard
			},
			textFieldEl
		))
		inputController.initialize()
		inputController.loadTabCompletionBehaviour()
		inputController.loadChatHistoryBehaviour()

		inputController.addEventListener('is_empty', 10, (event: CustomEvent) => {
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
				inputController.isShowingTabCompletorModal() ||
				ignoredKeys[evt.key] ||
				document.activeElement?.tagName === 'INPUT' ||
				document.activeElement?.getAttribute('contenteditable') ||
				evt.target.hasAttribute('capture-focus')
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

	getMessageContentString(chatMessageEl: HTMLElement) {
		const messageNodes = Array.from(
			chatMessageEl.querySelectorAll('.chat-entry .chat-message-identity + span ~ span')
		)
		let messageContent = []
		for (const messageNode of messageNodes) {
			if (messageNode.textContent) messageContent.push(messageNode.textContent)
			else if (messageNode.querySelector('img')) {
				const emoteName = messageNode.querySelector('img')?.getAttribute('data-emote-name')
				if (emoteName) messageContent.push(emoteName)
			}
		}

		return messageContent.join(' ')
	}

	loadReplyBehaviour() {
		const { channelData, inputController } = this
		if (!inputController) return error('Input controller not loaded for reply behaviour')

		const chatMessagesContainerEl = this.elm.chatMessagesContainer
		if (!chatMessagesContainerEl) return error('Chat messages container not loaded for reply behaviour')
		const chatMessagesContainerWrapperEl = chatMessagesContainerEl.parentElement!

		const replyMessageWrapperEl = document.createElement('div')
		replyMessageWrapperEl.classList.add('ntv__reply-message__wrapper')
		document.querySelector('#chatroom-footer .chat-mode')?.parentElement?.prepend(replyMessageWrapperEl)
		this.elm.replyMessageWrapper = replyMessageWrapperEl

		const replyMessageButtonCallback = (event: Event) => {
			event.preventDefault()
			event.stopPropagation()

			if (!this.inputController) return error('Input controller not loaded for reply behaviour')

			const targetMessage = chatMessagesContainerEl.querySelector(
				'.chat-entry.bg-secondary-lighter'
			)?.parentElement
			if (!targetMessage) return error('Reply target message not found')
			const messageNodes = Array.from(
				// targetMessage.querySelectorAll('& .chat-entry > span:nth-child(2) ~ span :is(span, img)')
				targetMessage.querySelectorAll('.chat-entry > span')
			)

			const chatEntryContentString = this.getMessageContentString(targetMessage)

			const chatEntryId = targetMessage.getAttribute('data-chat-entry')
			if (!chatEntryId) return error('Reply target message ID not found')

			const chatEntryUsernameEl = targetMessage.querySelector('.chat-entry-username')
			const chatEntryUserId = chatEntryUsernameEl?.getAttribute('data-chat-entry-user-id')
			if (!chatEntryUserId) return error('Reply target message user ID not found')

			const chatEntryUsername = chatEntryUsernameEl?.textContent
			if (!chatEntryUsername) return error('Reply target message username not found')

			this.replyMessage(messageNodes, chatEntryId, chatEntryContentString, chatEntryUserId, chatEntryUsername)
		}

		const observer = (this.replyObserver = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				if (mutation.addedNodes.length) {
					for (const messageNode of mutation.addedNodes) {
						if (
							messageNode instanceof HTMLElement &&
							messageNode.classList.contains('fixed') &&
							messageNode.classList.contains('z-10')
						) {
							messageNode.querySelector

							let replyBtnEl: HTMLElement | null = null

							if (channelData.me.is_moderator) {
								replyBtnEl = messageNode.querySelector('div:nth-child(2)')
							} else {
								replyBtnEl = messageNode.querySelector('div')
							}

							if (!replyBtnEl) return //error('Reply button element not found', messageNode)

							// The only way to remove Kick's event listeners from the button is to replace it with a new button
							const newButtonEl = replyBtnEl.cloneNode(true)
							replyBtnEl.replaceWith(newButtonEl)

							newButtonEl.addEventListener('click', replyMessageButtonCallback)
						}
					}
				} else if (mutation.removedNodes.length) {
					for (const messageNode of mutation.removedNodes) {
						if (messageNode instanceof HTMLElement) {
							if (
								messageNode instanceof HTMLElement &&
								messageNode.classList.contains('fixed') &&
								messageNode.classList.contains('z-10')
							) {
								let replyBtnEl: HTMLElement | null = null

								if (channelData.me.is_moderator) {
									replyBtnEl = messageNode.querySelector('div:nth-child(2)')
								} else {
									replyBtnEl = messageNode.querySelector('div')
								}

								replyBtnEl?.removeEventListener('click', replyMessageButtonCallback)
							}
						}
					}
				}
			})
		}))

		observer.observe(chatMessagesContainerWrapperEl, { childList: true })

		inputController.addEventListener('keydown', 9, (event: KeyboardEvent) => {
			if (event.key === 'Escape' && (this.replyMessageData || this.replyMessageComponent)) {
				this.destroyReplyMessageContext()
			}
		})

		document.addEventListener('keydown', (event: KeyboardEvent) => {
			if (event.key === 'Escape' && (this.replyMessageData || this.replyMessageComponent)) {
				this.destroyReplyMessageContext()
			}
		})
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
							wwindow.requestAnimationFrame(scrollToBottom)
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
		chatEntryNode.classList.add('ntv__chat-message')

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
		const chatEntryContentNodes = node.querySelectorAll('.chat-entry-content')
		if (!chatEntryContentNodes.length) return error('Pinned message content node not found', node)

		for (const chatEntryContentNode of chatEntryContentNodes) {
			this.renderEmotesInElement(chatEntryContentNode)
		}
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

		// const oldMessage = contentEditableEditor.getInputHTML()
		// contentEditableEditor.clearInput()

		// contentEditableEditor.insertEmote(emoteHid)
		// originalTextFieldEl.innerHTML = contentEditableEditor.getMessageContent()

		// originalTextFieldEl.dispatchEvent(new Event('input'))
		// originalSubmitButtonEl.dispatchEvent(new Event('click'))

		// this.eventBus.publish('ntv.ui.input_submitted', { suppressEngagementEvent: true })

		// contentEditableEditor.setInputContent(oldMessage)

		// originalTextFieldEl.innerHTML = oldMessage
		// originalTextFieldEl.dispatchEvent(new Event('input'))
	}

	insertNodesInChat(embedNodes: Node[]) {
		if (!embedNodes.length) return error('No nodes to insert in chat')

		const textFieldEl = this.elm.textField
		if (!textFieldEl) return error('Text field not loaded for inserting node')

		const selection = wwindow.getSelection()
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

		const selection = wwindow.getSelection()
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
		if (this.replyObserver) this.replyObserver.disconnect()
		if (this.pinnedMessageObserver) this.pinnedMessageObserver.disconnect()
		if (this.emoteMenu) this.emoteMenu.destroy()
		if (this.emoteMenuButton) this.emoteMenuButton.destroy()
		if (this.quickEmotesHolder) this.quickEmotesHolder.destroy()
	}
}
