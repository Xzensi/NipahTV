import {
	log,
	info,
	error,
	assertArgDefined,
	waitForElements,
	hex2rgb,
	parseHTML,
	findNodeWithTextContent
} from '../utils'
import { QuickEmotesHolderComponent } from './Components/QuickEmotesHolderComponent'
import { EmoteMenuButtonComponent } from './Components/EmoteMenuButtonComponent'
import { EmoteMenuComponent } from './Components/EmoteMenuComponent'
import { AbstractUserInterface } from './AbstractUserInterface'
import { InputController } from '../Managers/InputController'
import type { UserInfoModal } from './Modals/UserInfoModal'
import { Caret } from './Caret'

export class KickUserInterface extends AbstractUserInterface {
	private abortController = new AbortController()

	private chatObserver: MutationObserver | null = null
	private deletedChatEntryObserver: MutationObserver | null = null
	private replyObserver: MutationObserver | null = null
	private pinnedMessageObserver: MutationObserver | null = null
	private emoteMenu: EmoteMenuComponent | null = null
	private emoteMenuButton: EmoteMenuButtonComponent | null = null
	private quickEmotesHolder: QuickEmotesHolderComponent | null = null

	protected elm: {
		chatMessagesContainer: HTMLElement | null
		replyMessageWrapper: HTMLElement | null
		submitButton: HTMLElement | null
		textField: HTMLElement | null
		timersContainer: HTMLElement | null
	} = {
		chatMessagesContainer: null,
		replyMessageWrapper: null,
		submitButton: null,
		textField: null,
		timersContainer: null
	}

	private stickyScroll = true
	protected maxMessageLength = 500
	private isTheatreMode = false

	constructor(rootContext: RootContext, session: Session) {
		super(rootContext, session)
	}

	async loadInterface() {
		info('Creating user interface..')

		super.loadInterface()

		const { settingsManager, eventBus: rootEventBus } = this.rootContext
		const { channelData, eventBus } = this.session
		const { abortController } = this
		const abortSignal = abortController.signal

		this.loadSettings()

		// Wait for text input & submit button to load
		waitForElements(['#message-input', '#chatroom-footer button.base-button'], 10_000, abortSignal)
			.then(foundElements => {
				if (this.session.isDestroyed) return

				this.loadShadowProxyElements()
				this.loadEmoteMenu()
				this.loadEmoteMenuButton()
				this.loadQuickEmotesHolder()

				if (settingsManager.getSetting('shared.chat.behavior.smooth_scrolling')) {
					document.getElementById('chatroom')?.classList.add('ntv__smooth-scrolling')
				}
			})
			.catch(() => {})

		// Wait for chat messages container to load
		const chatroomContainerSelector = channelData.isVod ? 'chatroom-replay' : 'chatroom'
		const chatMessagesContainerSelector = channelData.isVod
			? '#chatroom-replay > .overflow-y-scroll > .flex-col-reverse'
			: '#chatroom > div:nth-child(2) > .overflow-y-scroll'

		waitForElements([chatMessagesContainerSelector], 10_000, abortSignal)
			.then(foundElements => {
				if (this.session.isDestroyed) return

				const [chatMessagesContainerEl] = foundElements as HTMLElement[]
				chatMessagesContainerEl.classList.add('ntv__chat-messages-container')

				this.elm.chatMessagesContainer = chatMessagesContainerEl

				const chatroomEl = document.getElementById(chatroomContainerSelector)
				if (chatroomEl) {
					// Add alternating background color to chat messages
					if (settingsManager.getSetting('shared.chat.appearance.alternating_background')) {
						chatroomEl.classList.add('ntv__alternating-background')
					}

					// Add seperator lines to chat messages
					const seperatorSettingVal = settingsManager.getSetting('shared.chat.appearance.seperators')
					if (seperatorSettingVal && seperatorSettingVal !== 'none') {
						chatroomEl.classList.add(`ntv__seperators-${seperatorSettingVal}`)
					}

					chatroomEl.addEventListener('copy', evt => {
						this.clipboard.handleCopyEvent(evt)
					})
				}

				// Render emotes in chat when providers are loaded
				eventBus.subscribe('ntv.providers.loaded', this.renderChatMessages.bind(this), true)

				this.observeChatMessages()
				this.observeChatEntriesForDeletionEvents()
				this.loadScrollingBehaviour()
				this.loadReplyBehaviour()
			})
			.catch(() => {})

		waitForElements(['#chatroom-top'], 10_000)
			.then(() => {
				if (this.session.isDestroyed) return

				this.observePinnedMessage()
			})
			.catch(() => {})

		waitForElements(['#chatroom-footer .send-row'], 10_000)
			.then(foundElements => {
				if (this.session.isDestroyed) return

				// Initialize a container for the timers UI
				const timersContainer = document.createElement('div')
				timersContainer.id = 'ntv__timers-container'
				foundElements[0].after(timersContainer)
				this.elm.timersContainer = timersContainer
			})
			.catch(() => {})

		this.loadTheatreModeBehaviour()

		if (channelData.isVod) {
			document.body.classList.add('ntv__kick__page-vod')
		} else {
			document.body.classList.add('ntv__kick__page-live-stream')
		}

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
		eventBus.subscribe('ntv.input_controller.submit', (data: any) => this.submitInput(false, data?.dontClearInput))

		// Set chat smooth scrolling mode
		rootEventBus.subscribe(
			'ntv.settings.change.shared.chat.behavior.smooth_scrolling',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				document.getElementById(chatroomContainerSelector)?.classList.toggle('ntv__smooth-scrolling', !!value)
			}
		)

		// Add alternating background color to chat messages
		rootEventBus.subscribe(
			'ntv.settings.change.shared.chat.appearance.alternating_background',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				//* Not respecting chatroomContainerSelector on purpose here because vods reverse the order of chat messages resulting in alternating background not working as expected
				document.getElementById('chatroom')?.classList.toggle('ntv__alternating-background', !!value)
			}
		)

		// Add seperator lines to chat messages
		rootEventBus.subscribe(
			'ntv.settings.change.shared.chat.appearance.seperators',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				if (prevValue !== 'none')
					document.getElementById(chatroomContainerSelector)?.classList.remove(`ntv__seperators-${prevValue}`)
				if (!value || value === 'none') return
				document.getElementById(chatroomContainerSelector)?.classList.add(`ntv__seperators-${value}`)
			}
		)

		// Chat theme change
		rootEventBus.subscribe(
			'ntv.settings.change.shared.chat.appearance.chat_theme',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				Array.from(document.getElementsByClassName('ntv__chat-message')).forEach((el: Element) => {
					if (prevValue !== 'none') el.classList.remove(`ntv__chat-message--theme-${prevValue}`)
					if (value !== 'none') el.classList.add(`ntv__chat-message--theme-${value}`)
				})
			}
		)

		// On sigterm signal, cleanup user interface
		eventBus.subscribe('ntv.session.destroy', this.destroy.bind(this))
	}

	// TODO move methods like this to super class. this.elm.textfield event can be in contentEditableEditor
	async loadEmoteMenu() {
		if (!this.session.channelData.me.isLoggedIn) return
		if (!this.elm.textField) return error('Text field not loaded for emote menu')

		const container = this.elm.textField.parentElement!.parentElement!
		this.emoteMenu = new EmoteMenuComponent(this.rootContext, this.session, container).init()

		this.elm.textField.addEventListener('click', this.emoteMenu.toggleShow.bind(this.emoteMenu, false))
	}

	async loadEmoteMenuButton() {
		this.emoteMenuButton = new EmoteMenuButtonComponent(this.rootContext, this.session).init()
	}

	async loadQuickEmotesHolder() {
		const { settingsManager } = this.rootContext
		const { eventBus } = this.session
		const quickEmotesHolderEnabled = settingsManager.getSetting('shared.chat.quick_emote_holder.enabled')
		if (quickEmotesHolderEnabled) {
			const placeholder = document.createElement('div')
			document.querySelector('#chatroom-footer .chat-mode')?.parentElement?.prepend(placeholder)
			this.quickEmotesHolder = new QuickEmotesHolderComponent(this.rootContext, this.session, placeholder).init()
		}

		eventBus.subscribe(
			'ntv.settings.change.shared.chat.quick_emote_holder.enabled',
			({ value, prevValue }: any) => {
				if (value) {
					const placeholder = document.createElement('div')
					document.querySelector('#chatroom-footer .chat-mode')?.parentElement?.prepend(placeholder)
					this.quickEmotesHolder = new QuickEmotesHolderComponent(
						this.rootContext,
						this.session,
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
		const { settingsManager } = this.rootContext
		const { eventBus } = this.session

		const firstMessageHighlightColor = settingsManager.getSetting('shared.chat.appearance.highlight_color')
		if (firstMessageHighlightColor) {
			const rgb = hex2rgb(firstMessageHighlightColor)
			document.documentElement.style.setProperty(
				'--ntv-background-highlight-accent-1',
				`rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.125)`
			)
		}

		eventBus.subscribe(
			'ntv.settings.change.shared.chat.appearance.highlight_color',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				if (!value) return
				const rgb = hex2rgb(value)
				document.documentElement.style.setProperty(
					'--ntv-background-highlight-accent-1',
					`rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.125)`
				)
			}
		)
	}

	loadShadowProxyElements() {
		if (!this.session.channelData.me.isLoggedIn) return

		//////////////////////////////////////
		//====// Proxy Submit Button //====//
		const submitButtonEl = (this.elm.submitButton = parseHTML(
			`<button class="ntv__submit-button disabled">Chat</button>`,
			true
		) as HTMLElement)

		const originalSubmitButtonEl = document.querySelector('#chatroom-footer button.base-button')
		if (originalSubmitButtonEl) {
			originalSubmitButtonEl.after(submitButtonEl)
		} else {
			error('Submit button not found')
		}

		///////////////////////////////////
		//====// Proxy Text Field //====//
		const originalTextFieldEl = document.querySelector('#message-input') as HTMLElement | undefined
		if (!originalTextFieldEl) return error('Original text field not found')

		const placeholder = originalTextFieldEl.dataset.placeholder || 'Send message...'
		const textFieldEl = (this.elm.textField = parseHTML(
			`<div id="ntv__message-input" tabindex="0" contenteditable="true" spellcheck="false" placeholder="${placeholder}"></div>`,
			true
		) as HTMLElement)

		const textFieldWrapperEl = parseHTML(
			`<div class="ntv__message-input__wrapper" data-char-limit="${this.maxMessageLength}"></div>`,
			true
		) as HTMLElement

		// Cleanup any remaining chat input wrappers from previous sessions
		document.querySelectorAll('.ntv__message-input__wrapper').forEach(el => el.remove())
		document.querySelectorAll('.ntv__message-input').forEach(el => el.remove())

		originalTextFieldEl.parentElement!.parentElement?.append(textFieldWrapperEl)
		textFieldWrapperEl.append(textFieldEl)

		const moderatorChatIdentityBadgeIconEl = document.querySelector('.chat-input-wrapper .chat-input-icon')
		if (moderatorChatIdentityBadgeIconEl) textFieldEl.before(moderatorChatIdentityBadgeIconEl)

		document.getElementById('chatroom')?.classList.add('ntv__hide-chat-input')

		////////////////////////////////////////////////
		//====// Proxy Element Event Listeners //====//
		this.submitButtonPriorityEventTarget.addEventListener('click', 10, this.submitInput.bind(this))
		submitButtonEl.addEventListener('click', event => this.submitButtonPriorityEventTarget.dispatchEvent(event))

		const inputController = (this.inputController = new InputController(
			this.rootContext,
			this.session,
			{
				clipboard: this.clipboard,
				submitButtonPriorityEventTarget: this.submitButtonPriorityEventTarget
			},
			textFieldEl
		))
		inputController.initialize()
		inputController.loadTabCompletionBehaviour()
		inputController.loadChatHistoryBehaviour()

		// User is already timedout or banned, disable chat input and show reason
		// TODO refactor this when websockets are implemented
		if (originalTextFieldEl.getAttribute('contenteditable') !== 'true') {
			this.changeInputStatus('disabled', originalTextFieldEl.getAttribute('data-placeholder'))
		}

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
			if (!inputController.contentEditableEditor.isEnabled()) return
			evt.preventDefault()
			textFieldEl.focus()
		})

		textFieldEl.addEventListener('cut', evt => {
			this.clipboard.handleCutEvent(evt)
		})

		this.session.eventBus.subscribe('ntv.input_controller.character_count', ({ value }: any) => {
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
		document.body.addEventListener('keydown', evt => {
			if (
				evt.ctrlKey ||
				evt.altKey ||
				evt.metaKey ||
				ignoredKeys[evt.key] ||
				inputController.isShowingTabCompletorModal() ||
				document.activeElement?.tagName === 'INPUT' ||
				document.activeElement?.getAttribute('contenteditable') ||
				(<HTMLElement>evt.target)?.hasAttribute('capture-focus') ||
				!inputController.contentEditableEditor.isEnabled() ||
				document.getElementById('modal-content')
			) {
				return
			}

			textFieldEl.focus()
			this.inputController?.contentEditableEditor.forwardEvent(evt)
		})

		this.observeInputFieldStatusEvents(originalTextFieldEl)
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

	loadTheatreModeBehaviour() {
		if (this.session.isDestroyed) return

		const { settingsManager } = this.rootContext
		const { channelData } = this.session

		const handleTheatreModeSwitchFn = (isTheatreMode: boolean) => {
			log('Theater mode button clicked', isTheatreMode)

			if (settingsManager.getSetting('shared.appearance.layout.overlay_chat')) {
				if (channelData.isVod) {
				} else {
				}

				log('FLAG_0')
				log(document.getElementById('main-view')?.querySelector('.chat-container')?.parentElement)
				log(document.getElementById('theaterModeChatHolder')?.parentElement)
				log(document.getElementById('video-holder'))

				document
					.getElementById('main-view')
					?.querySelector('.chat-container')
					?.parentElement?.classList.toggle('ntv__kick__theater-mode__chat-container', isTheatreMode)
				document
					.getElementById('theaterModeChatHolder')
					?.parentElement?.classList.toggle('ntv__kick__theater-mode__chat-container', isTheatreMode)
				document
					.getElementById('video-holder')
					?.classList.toggle('ntv__kick__theater-mode__video-holder', isTheatreMode)
			}
		}

		const handleTheatreModeButtonFn = () => {
			waitForElements(
				[
					'#theaterModeVideoHolder',
					'#main-view',
					'#video-holder .vjs-control-bar .vjs-button > .kick-icon-theater'
				],
				10_000
			)
				.then(foundElements => {
					if (this.session.isDestroyed) return

					const [theaterModeVideoHolderEl, mainViewEl, theaterModeButtonEl] = foundElements
					theaterModeButtonEl.addEventListener(
						'click',
						() => {
							this.isTheatreMode = !this.isTheatreMode
							theaterModeVideoHolderEl.classList.toggle('ntv__kick__theater-mode', this.isTheatreMode)
							mainViewEl.classList.toggle('ntv__kick__theater-mode', this.isTheatreMode)
							setTimeout(() => {
								handleTheatreModeSwitchFn(this.isTheatreMode)
								handleTheatreModeButtonFn()
							}, 5)
						},
						{ passive: true, once: true }
					)
				})
				.catch(() => {})
		}

		handleTheatreModeButtonFn()
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
		const { inputController } = this
		const { channelData } = this.session
		if (!channelData.me.isLoggedIn) return
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
			if (!targetMessage) return this.toastError('Reply target message not found')

			const messageNodes = Array.from(
				// targetMessage.querySelectorAll('& .chat-entry > span:nth-child(2) ~ span :is(span, img)')
				targetMessage.classList.contains('ntv__chat-message')
					? targetMessage.querySelectorAll('.chat-entry > span')
					: targetMessage.querySelectorAll('.chat-message-identity, .chat-message-identity ~ span')
			)
			if (!messageNodes.length)
				return this.toastError('Unable to reply to message, target message content not found')

			const chatEntryContentString = this.getMessageContentString(targetMessage)

			const chatEntryId = targetMessage.getAttribute('data-chat-entry')
			if (!chatEntryId) return this.toastError('Unable to reply to message, target message ID not found')

			const chatEntryUsernameEl = targetMessage.querySelector('.chat-entry-username')
			const chatEntryUserId = chatEntryUsernameEl?.getAttribute('data-chat-entry-user-id')
			if (!chatEntryUserId) return this.toastError('Unable to reply to message, target message user ID not found')

			const chatEntryUsername = chatEntryUsernameEl?.textContent
			if (!chatEntryUsername)
				return this.toastError('Unable to reply to message, target message username not found')

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

							// It's painful, but this seems to be the only reliable way to get the reply button element
							const replyBtnEl = messageNode.querySelector(
								'[d*="M9.32004 4.41501H7.51004V1.29001L1.41504"]'
							)?.parentElement?.parentElement?.parentElement
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
								const replyBtnEl = messageNode.querySelector(
									'[d*="M9.32004 4.41501H7.51004V1.29001L1.41504"]'
								)?.parentElement?.parentElement?.parentElement

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

		const scrollToBottom = () => (chatMessagesContainerEl.scrollTop = 99999)

		this.session.eventBus.subscribe(
			'ntv.providers.loaded',
			() => {
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
			},
			true
		)

		// Show emote tooltip with emote name, remove when mouse leaves
		const showTooltips = this.rootContext.settingsManager.getSetting('shared.chat.tooltips.images')
		chatMessagesContainerEl.addEventListener('mouseover', evt => {
			const target = evt.target as HTMLElement
			if (target.tagName !== 'IMG' || !target?.parentElement?.classList.contains('ntv__inline-emote-box')) return

			const emoteName = target.getAttribute('data-emote-name')
			if (!emoteName) return

			const tooltipEl = parseHTML(
				`<div class="ntv__emote-tooltip__wrapper"><div class="ntv__emote-tooltip ${
					showTooltips ? 'ntv__emote-tooltip--has-image' : ''
				}">${
					showTooltips ? target.outerHTML.replace('chat-emote', '') : ''
				}<span>${emoteName}</span></div></div>`,
				true
			) as HTMLElement

			target.after(tooltipEl)

			target.addEventListener(
				'mouseleave',
				() => {
					tooltipEl.remove()
				},
				{ once: true, passive: true }
			)
		})

		chatMessagesContainerEl.addEventListener('click', evt => {
			const target = evt.target as HTMLElement

			// Insert emote in chat input when clicked
			if (target.tagName === 'IMG' && target?.parentElement?.classList.contains('ntv__inline-emote-box')) {
				const emoteHid = target.getAttribute('data-emote-hid')
				if (emoteHid) this.inputController?.contentEditableEditor.insertEmote(emoteHid)
			}

			// Show user info modal when clicking usernames
			else if (target.tagName === 'SPAN') {
				evt.stopPropagation()

				const identityContainer = target.classList.contains('chat-message-identity')
					? target
					: target.closest('.chat-message-identity')
				if (!identityContainer) return

				const usernameEl = identityContainer ? identityContainer.querySelector('.chat-entry-username') : null
				const username = usernameEl?.textContent
				const rect = identityContainer.getBoundingClientRect()
				const screenPosition = { x: rect.x, y: rect.y - 100 }
				if (username) this.handleUserInfoModalClick(username, screenPosition)
			}
		})
	}

	observeInputFieldStatusEvents(inputField: HTMLElement) {
		// TODO refactor this when websockets are implemented
		const inputFieldObserver = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				if (mutation.attributeName === 'contenteditable') {
					const isContentEditable = inputField.getAttribute('contenteditable') === 'true'

					if (isContentEditable) {
						this.elm.submitButton?.classList.remove('disabled')
						this.changeInputStatus('enabled')
					} else {
						const reason = inputField.getAttribute('data-placeholder')
						this.elm.submitButton?.classList.add('disabled')
						this.changeInputStatus('disabled', reason)
					}
				}
			})
		})

		inputFieldObserver.observe(inputField, {
			childList: false,
			subtree: false,
			attributes: true,
			attributeFilter: ['contenteditable']
		})
	}

	/**
	 * We unpack the Kick chat entries to our optimized format, however to be able to detect
	 *  when a chat entry is deleted we need to observe a preserved untouched original Kick chat entry.
	 *
	 * TODO eventually replace this completely by a new funnel where receive message deletion events over websocket.
	 */
	observeChatEntriesForDeletionEvents() {
		this.deletedChatEntryObserver = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				if (mutation.addedNodes.length && mutation.addedNodes[0] instanceof HTMLElement) {
					const addedNode = mutation.addedNodes[0]
					const chatEntryNode = addedNode.closest('.chat-entry')! as HTMLElement

					let messageWrapperNode = addedNode
					while (messageWrapperNode.parentElement && messageWrapperNode.parentElement !== chatEntryNode)
						messageWrapperNode = messageWrapperNode.parentElement
					if (messageWrapperNode.parentElement !== chatEntryNode)
						return error('Message wrapper node not found')

					// For moderators Kick appends " (Deleted)" to the message content with a tailwind class of "text-xs"
					if (addedNode.className === 'text-xs') {
						// messageNode.remove()
						messageWrapperNode.style.display = 'none'
						addedNode.className = ''
						chatEntryNode.closest('.ntv__chat-message')?.classList.add('ntv__chat-message--deleted')
						chatEntryNode.append(addedNode)
					}
					// For regular viewers Kick appends a new span with a class of "chat-entry-content-deleted"
					else if (addedNode.className === 'chat-entry-content-deleted') {
						// messageNode.remove()
						messageWrapperNode.style.display = 'none'
						chatEntryNode.parentElement?.classList.add('ntv__chat-message--deleted')
						Array.from(chatEntryNode.getElementsByClassName('ntv__chat-message__part')).forEach(node =>
							node.remove()
						)

						const deletedMessageNode = mutation.addedNodes[0]
						const deletedMessageContent = deletedMessageNode.textContent || 'Deleted by a moderator'
						chatEntryNode.append(
							parseHTML(`<span class="ntv__chat-message__part">${deletedMessageContent}</span>`, true)
						)
					}
				}
			})
		})
	}

	handleUserInfoModalClick(username: string, screenPosition?: { x: number; y: number }) {
		// if (username) this.showUserInfoModal(username, screenPosition)
		// waitForElements("#chatroom > .user-profile")

		// Create observer to wait for userprofile container to exists where a descendant ".information .username" element of it has the username as text to make sure that it's the right user profile container element.
		// The userprofile container elements are created at "#chatroom > .user-profile"
		// We add a timeout incase the userprofile container element never appears.

		const userInfoModal = this.showUserInfoModal(username, screenPosition)

		const processKickUserProfileModal = function (
			userInfoModal: UserInfoModal,
			kickUserInfoModalContainerEl: HTMLElement
		) {
			// User info modal was already destroyed before Kick modal had chance to load
			if (userInfoModal.isDestroyed()) {
				log('User info modal is already destroyed, cleaning up Kick modal..')
				destroyKickModal(kickUserInfoModalContainerEl)
				return
			}

			userInfoModal.addEventListener('destroy', () => {
				log('Destroying modal..')
				destroyKickModal(kickUserInfoModalContainerEl)
			})

			kickUserInfoModalContainerEl.style.display = 'none'
			kickUserInfoModalContainerEl.style.opacity = '0'

			const giftSubButton = getGiftSubButtonInElement(kickUserInfoModalContainerEl)

			if (giftSubButton) {
				// Gift sub button already exists
				connectGiftSubButtonInModal(userInfoModal, giftSubButton)
			} else {
				// Wait for gift sub button to appear, if it does at all.
				const giftButtonObserver = new MutationObserver(mutations2 => {
					for (const mutation2 of mutations2) {
						for (const node2 of mutation2.addedNodes) {
							const giftSubButton = node2 instanceof HTMLElement ? getGiftSubButtonInElement(node2) : null

							// Found gift sub button
							if (giftSubButton) {
								giftButtonObserver.disconnect()
								connectGiftSubButtonInModal(userInfoModal, giftSubButton)
								return
							}
						}
					}
				})

				giftButtonObserver.observe(kickUserInfoModalContainerEl, {
					childList: true,
					subtree: true
				})
				setTimeout(() => giftButtonObserver.disconnect(), 20_000)
			}
		}

		const connectGiftSubButtonInModal = function (userInfoModal: UserInfoModal, giftSubButton: Element) {
			// Watch for gift sub button clicks on our own user info modal and forward the events to the original gift sub button
			userInfoModal.addEventListener('gift_sub_click', () => {
				giftSubButton.dispatchEvent(new Event('click'))
			})

			userInfoModal.enableGiftSubButton()
		}

		const destroyKickModal = function (container: Element) {
			container?.querySelector('.header button.close')?.dispatchEvent(new Event('click'))
			// container?.remove() <-- Causes Kick to throw an error
		}

		const getGiftSubButtonInElement = function (element: Element) {
			return element
				.querySelector('button path[d^="M13.8056 4.98234H11.5525L13.2544 3.21047L11.4913"]')
				?.closest('button') as Element | null
		}

		// Has a Kick user profile modal already been loaded? We can use it immediately then.
		const kickUserProfileCards = Array.from(document.querySelectorAll('.base-floating-card.user-profile'))
		const kickUserInfoModalContainerEl = kickUserProfileCards.find(node => findNodeWithTextContent(node, username))

		if (kickUserInfoModalContainerEl) {
			userInfoModal.addEventListener('destroy', () => {
				destroyKickModal(kickUserInfoModalContainerEl)
			})

			processKickUserProfileModal(userInfoModal, kickUserInfoModalContainerEl as HTMLElement)
		} else {
			// Wait for user profile container to appear.
			const userProfileObserver = new MutationObserver(mutations => {
				for (const mutation of mutations) {
					for (const node of mutation.addedNodes) {
						if (node instanceof HTMLElement && node.classList.contains('user-profile')) {
							const usernameEl = node.querySelector('.information .username')

							if (usernameEl && usernameEl.textContent === username) {
								const kickUserInfoModalContainerEl = node
								userProfileObserver.disconnect()

								processKickUserProfileModal(userInfoModal, kickUserInfoModalContainerEl)
								return
							}
						}
					}
				}
			})

			userProfileObserver.observe(document.getElementById('main-view')!, { childList: true, subtree: true })
			setTimeout(() => userProfileObserver.disconnect(), 20_000)
		}
	}

	observePinnedMessage() {
		const chatroomTopEl = document.getElementById('chatroom-top')
		if (!chatroomTopEl) return error('Chatroom top not loaded for observing pinned message')

		this.session.eventBus.subscribe('ntv.providers.loaded', () => {
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
		const { settingsManager } = this.rootContext
		const { emotesManager, usersManager } = this.session
		const { channelData } = this.session

		if (!channelData.isVod) {
			const usernameEl = messageNode.querySelector('.chat-entry-username') as HTMLElement
			if (usernameEl) {
				const { chatEntryUser, chatEntryUserId } = usernameEl.dataset
				const chatEntryUserName = usernameEl.textContent
				if (chatEntryUserId && chatEntryUserName) {
					if (usersManager.hasMutedUser(chatEntryUserId)) {
						messageNode.remove()
						return
					}

					if (!usersManager.hasSeenUser(chatEntryUserId)) {
						const enableFirstMessageHighlight = settingsManager.getSetting(
							'shared.chat.appearance.highlight_first_message'
						)
						const highlightWhenModeratorOnly = settingsManager.getSetting(
							'shared.chat.appearance.highlight_first_message_moderator'
						)
						if (
							enableFirstMessageHighlight &&
							(!highlightWhenModeratorOnly || (highlightWhenModeratorOnly && channelData.me.isModerator))
						) {
							messageNode.classList.add('ntv__highlight-first-message')
						}
					}
					usersManager.registerUser(chatEntryUserId, chatEntryUserName)
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
						<span class="chat-entry-content-deleted"></span> <--|| Element created when message is deleted, elements below are removed ||
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
			messageWrapperNode = chatEntryNode.children[1] as HTMLElement
		} else {
			messageWrapperNode = chatEntryNode.children[0] as HTMLElement
		}

		const messageIdentityNode = chatEntryNode.querySelector('.chat-message-identity')
		if (messageIdentityNode) {
			messageIdentityNode.classList.add('ntv__chat-message__identity')
			// Replace message identity with clone to nuke all evenListeners
			// messageIdentityNode.replaceWith(messageIdentityNode.cloneNode(true))

			const usernameNode = messageIdentityNode.querySelector('.chat-entry-username')
			if (usernameNode) usernameNode.classList.add('ntv__chat-message__username')
		}

		const contentNodes = Array.from(messageWrapperNode.children)
		const contentNodesLength = contentNodes.length

		// We remove the useless wrapper node because we unpack it's contents to parent
		// messageWrapperNode.remove()
		// Temporary workaround: We hide the message wrapper node instead of removing it, because we observe descendants of the message wrapper node for deletion events
		messageWrapperNode.style.display = 'none'

		if (contentNodes.length && contentNodes[0].classList.contains('text-gray-400')) {
			contentNodes[0].classList.add('ntv__chat-message__timestamp')
		}

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
					const nodes = this.renderEmotesInString(componentNode.textContent || '')
					// componentNode.remove()
					chatEntryNode.append(...nodes)
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

		// We remove all children of the message wrapper node but one, because we've unpacked them to the parent
		//  and then attach an observer to the last child to listen for when the message is deleted,
		//  so then we can handle the deletion of the message in our format.
		for (let i = 1; i < messageWrapperNode.children.length; i++) messageWrapperNode.children[i].remove()
		const firstChild = messageWrapperNode.children[0]
		if (firstChild) {
			// Observe class changes to detect when message is deleted
			this.deletedChatEntryObserver?.observe(messageWrapperNode, {
				childList: true,
				subtree: false
			})
		}

		// Adding this class removes the display: none from the chat message, causing a reflow
		const chatTheme = settingsManager.getSetting('shared.chat.appearance.chat_theme')
		if (chatTheme === 'rounded') {
			messageNode.classList.add('ntv__chat-message', 'ntv__chat-message--theme-rounded')
		} else {
			messageNode.classList.add('ntv__chat-message')
		}
	}

	renderPinnedMessage(node: HTMLElement) {
		this.renderChatMessage(node)
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
		if (this.replyObserver) this.replyObserver.disconnect()
		if (this.pinnedMessageObserver) this.pinnedMessageObserver.disconnect()
		if (this.inputController) this.inputController.destroy()
		if (this.emoteMenu) this.emoteMenu.destroy()
		if (this.emoteMenuButton) this.emoteMenuButton.destroy()
		if (this.quickEmotesHolder) this.quickEmotesHolder.destroy()
	}
}
