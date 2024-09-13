import {
	log,
	info,
	error,
	assertArgDefined,
	waitForElements,
	hex2rgb,
	parseHTML,
	findNodeWithTextContent,
	waitForTargetedElements,
	isElementInDOM
} from '../utils'
import QuickEmotesHolderComponent from './Components/QuickEmotesHolderComponent'
import EmoteMenuButtonComponent from './Components/EmoteMenuButtonComponent'
import EmoteMenuComponent from './Components/EmoteMenuComponent'
import AbstractUserInterface from './AbstractUserInterface'
import InputController from '../Classes/InputController'
import type UserInfoModal from './Modals/UserInfoModal'
import type { Badge } from '../Providers/BadgeProvider'
import { Caret } from './Caret'
import { U_TAG_NTV_AFFIX } from '../constants'

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
		originalSubmitButton: HTMLElement | null
		textField: HTMLElement | null
		timersContainer: HTMLElement | null
	} = {
		chatMessagesContainer: null,
		replyMessageWrapper: null,
		submitButton: null,
		originalSubmitButton: null,
		textField: null,
		timersContainer: null
	}

	private stickyScroll = true
	protected maxMessageLength = 500
	private queuedChatMessages: HTMLElement[] = []

	constructor(rootContext: RootContext, session: Session) {
		super(rootContext, session)
	}

	async loadInterface() {
		info('Creating user interface..')

		super.loadInterface()

		const { abortController } = this
		const { settingsManager, eventBus: rootEventBus } = this.rootContext
		const { channelData, eventBus } = this.session
		const { channelId } = channelData
		const abortSignal = abortController.signal

		this.loadAnnouncements()
		this.loadSettings()

		// Wait for text input & submit button to load
		const footerSelector = '#channel-chatroom > div > div > .z-common:not(.absolute)'
		waitForElements(
			[
				'#channel-chatroom .editor-input[contenteditable="true"]',
				`${footerSelector} button.select-none.bg-green-500.rounded`
			],
			10_000,
			abortSignal
		)
			.then(foundElements => {
				if (this.session.isDestroyed) return

				const [textFieldEl, submitButtonEl] = foundElements as HTMLElement[]
				this.loadInputBehaviour(textFieldEl, submitButtonEl)
				this.loadEmoteMenu()
			})
			.catch(() => {})

		// Wait for chat footer to load
		waitForElements([`${footerSelector}`], 10_000, abortSignal)
			.then(foundElements => {
				if (this.session.isDestroyed) return

				const [footerEl] = foundElements as HTMLElement[]
				footerEl.classList.add('kick__chat-footer')

				// Initialize a container for the timers UI
				const timersContainer = document.createElement('div')
				timersContainer.id = 'ntv__timers-container'
				footerEl.append(timersContainer)
				this.elm.timersContainer = timersContainer

				waitForElements([`${footerSelector}`], 10_000, abortSignal)
					.then(foundElements => {
						if (this.session.isDestroyed) return

						const [footerEl] = foundElements as HTMLElement[]
						const quickEmotesHolderEl = footerEl.querySelector('& > .overflow-hidden') as HTMLElement
						this.loadQuickEmotesHolder(footerEl, quickEmotesHolderEl)
					})
					.catch(() => {})

				waitForElements([`${footerSelector} > div.flex > .flex.items-center`], 10_000, abortSignal)
					.then(foundElements => {
						if (this.session.isDestroyed) return

						const [footerBottomBarEl] = foundElements as HTMLElement[]
						this.loadEmoteMenuButton(footerBottomBarEl)
					})
					.catch(() => {})
			})
			.catch(() => {})

		const chatroomContainerSelector = channelData.isVod ? 'chatroom-replay' : 'chatroom'
		const chatMessagesContainerSelector = channelData.isVod
			? '#chatroom-replay > .overflow-y-scroll > .flex-col-reverse' // TODO chat container of VODs
			: '#chatroom-messages > .no-scrollbar'

		// Wait for chat messages container to load
		waitForElements([chatMessagesContainerSelector], 10_000, abortSignal)
			.then(foundElements => {
				if (this.session.isDestroyed) return

				const [chatMessagesContainerEl] = foundElements as HTMLElement[]
				chatMessagesContainerEl.classList.add('ntv__chat-messages-container')

				this.elm.chatMessagesContainer = chatMessagesContainerEl

				// Show timestamps for messages
				if (settingsManager.getSetting(channelId, 'chat.appearance.show_timestamps')) {
					chatMessagesContainerEl.classList.add('ntv__show-message-timestamps')
				}

				// Add alternating background color to chat messages
				if (settingsManager.getSetting(channelId, 'chat.appearance.alternating_background')) {
					chatMessagesContainerEl.classList.add('ntv__alternating-background')
				}

				// Add seperator lines to chat messages
				const seperatorSettingVal = settingsManager.getSetting(channelId, 'chat.appearance.seperators')
				if (seperatorSettingVal && seperatorSettingVal !== 'none') {
					chatMessagesContainerEl.classList.add(`ntv__seperators-${seperatorSettingVal}`)
				}

				if (settingsManager.getSetting(channelId, 'chat.behavior.smooth_scrolling')) {
					chatMessagesContainerEl.classList.add('ntv__smooth-scrolling')
				}

				chatMessagesContainerEl.addEventListener('copy', evt => {
					this.clipboard.handleCopyEvent(evt)
				})

				// Render emotes in chat when providers are loaded
				eventBus.subscribe('ntv.providers.loaded', this.loadChatMesssageRenderingBehaviour.bind(this), true)

				// TODO due overaul
				// this.observePinnedMessage(chatMessagesContainerEl)
				this.observeChatEntriesForDeletionEvents()
				this.observeChatMessages(chatMessagesContainerEl)
				this.loadTheatreModeBehaviour()

				// this.loadScrollingBehaviour()

				// 		// TODO refactor this, it depends on the chat messages container and inputController but load timing might be off
				// 		this.loadReplyBehaviour()
			})
			.catch(() => {})

		// waitForElements(['#chatroom-footer .send-row'], 10_000)
		// 	.then(foundElements => {
		// 		if (this.session.isDestroyed) return

		// if (channelData.isVod) {
		// 	document.body.classList.add('ntv__kick__page-vod')
		// 	this.loadTheatreModeBehaviour()
		// } else {
		// 	document.body.classList.add('ntv__kick__page-live-stream')
		// }

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

		// Set chat show message timestamps
		rootEventBus.subscribe(
			'ntv.settings.change.chat.appearance.show_timestamps',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				document
					.querySelector('.ntv__chat-messages-container')
					?.classList.toggle('ntv__show-message-timestamps', !!value)
			}
		)

		// Set chat smooth scrolling mode
		rootEventBus.subscribe(
			'ntv.settings.change.chat.behavior.smooth_scrolling',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				document
					.querySelector('.ntv__chat-messages-container')
					?.classList.toggle('ntv__smooth-scrolling', !!value)
			}
		)

		// Add alternating background color to chat messages
		rootEventBus.subscribe(
			'ntv.settings.change.chat.appearance.alternating_background',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				//* Not respecting chatroomContainerSelector on purpose here because vods reverse the order of chat messages resulting in alternating background not working as expected
				document
					.querySelector('.ntv__chat-messages-container')
					?.classList.toggle('ntv__alternating-background', !!value)
			}
		)

		// Add seperator lines to chat messages
		rootEventBus.subscribe(
			'ntv.settings.change.chat.appearance.seperators',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				if (prevValue !== 'none')
					document
						.querySelector('.ntv__chat-messages-container')
						?.classList.remove(`ntv__seperators-${prevValue}`)
				if (!value || value === 'none') return
				document.querySelector('.ntv__chat-messages-container')?.classList.add(`ntv__seperators-${value}`)
			}
		)

		// Chat messages spacing settings change
		rootEventBus.subscribe(
			'ntv.settings.change.chat.appearance.messages_spacing',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				Array.from(document.getElementsByClassName('ntv__chat-message')).forEach((el: Element) => {
					if (prevValue !== 'none') el.classList.remove(`ntv__chat-message--${prevValue}`)
					if (value !== 'none') el.classList.add(`ntv__chat-message--${value}`)
				})
			}
		)

		// Chat messages style settings change
		rootEventBus.subscribe(
			'ntv.settings.change.chat.appearance.messages_style',
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

		const container = this.elm.textField.parentElement!.parentElement!.parentElement!
		this.emoteMenu = new EmoteMenuComponent(this.rootContext, this.session, container).init()

		this.elm.textField.addEventListener('click', this.emoteMenu.toggleShow.bind(this.emoteMenu, false))
	}

	async loadEmoteMenuButton(kickFooterBottomBarEl: HTMLElement) {
		const placeholder = document.createElement('div')
		// const footerBottomBarEl = kickFooterBottomBarEl.lastElementChild?.lastElementChild
		// if (!footerBottomBarEl) return error('Footer bottom bar not found for emote menu button')

		const footerSubmitButtonWrapper = kickFooterBottomBarEl.lastElementChild
		if (!footerSubmitButtonWrapper) return error('Footer submit button wrapper not found for emote menu button')

		footerSubmitButtonWrapper.prepend(placeholder)
		this.emoteMenuButton = new EmoteMenuButtonComponent(this.rootContext, this.session, placeholder).init()
	}

	async loadQuickEmotesHolder(kickFooterEl: HTMLElement, kickQuickEmotesHolderEl?: HTMLElement) {
		const { settingsManager } = this.rootContext
		const { eventBus, channelData } = this.session
		const { channelId } = channelData
		const quickEmotesHolderEnabled = settingsManager.getSetting(channelId, 'quick_emote_holder.enabled')

		if (quickEmotesHolderEnabled) {
			const placeholder = document.createElement('div')
			log('ADSSDDADS', kickQuickEmotesHolderEl)
			kickFooterEl.prepend(placeholder)
			kickQuickEmotesHolderEl?.style.setProperty('display', 'none', 'important')
			this.quickEmotesHolder = new QuickEmotesHolderComponent(this.rootContext, this.session, placeholder).init()
		}

		eventBus.subscribe('ntv.settings.change.quick_emote_holder.enabled', ({ value, prevValue }: any) => {
			if (value) {
				const placeholder = document.createElement('div')
				kickFooterEl.prepend(placeholder)
				kickQuickEmotesHolderEl?.style.setProperty('display', 'none', 'important')
				this.quickEmotesHolder = new QuickEmotesHolderComponent(
					this.rootContext,
					this.session,
					placeholder
				).init()
			} else {
				this.quickEmotesHolder?.destroy()
				this.quickEmotesHolder = null
				kickQuickEmotesHolderEl?.style.removeProperty('display')
			}
		})
	}

	loadAnnouncements() {
		const rootContext = this.rootContext
		if (!rootContext) throw new Error('Root context is not initialized.')
		const { announcementService, eventBus: rootEventBus } = rootContext

		const showAnnouncements = () => {
			// announcementService.registerAnnouncement({
			// 	id: 'website_overhaul_sept_2024',
			// 	dateTimeRange: [new Date(1726618455607)],
			// 	message: `
			// 		<h2>Major Kick website overhaul</h2>
			// 		<p>As I'm sure many of you are aware by now, and perhaps you just found out by the time you read this announcement because it already happened, Kick has planned a major overhaul of the website.</p>
			// 		<p>As reportedly planned it currently stands to be released on:</p>
			// 		<ul>
			// 			<li><b>Monday 9 Sept</b> for all of Oceania</li>
			// 			<li><b>Tuesday 10 Sept</b> for Latin America</li>
			// 			<li><b>Wednesday 11 Sept</b> for Europe</li>
			// 			<li><b>Thursday 12 Sept</b> for North America</li>
			// 		</ul>
			// 		<p>It is not yet known in what ways the new website will break NipahTV, but we will do our best to keep up with the changes and provide you with the best experience possible. If it turns out to be utterly broken, simply temporarily disable the extension/userscript until we can push an update to fix it. Please be patient and allow us some time to adjust to the coming changes.</p>
			// 		<p>Thank you for supporting NipahTV!</p>
			// 	`
			// })

			announcementService.registerAnnouncement({
				id: 'website_overhaul_sept_2024_update',
				dateTimeRange: [new Date(1727595396025)],
				message: `
					<h2><strong>NipahTV Update: Kick Website Overhaul</strong></h2>
					<p>I have been hard at work since Kick's major website overhaul (about 12 hours ago, 10 Sept) and am excited to share that <strong>NipahTV is back up and functional</strong> with most core functionality restored!</p>
					<p>For those who are new or out of the loop, Kick introduced a complete redesign of their site yesterday, which has affected NipahTV and other extensions. While there’s still a lot more to be done, you can once again enjoy the core features of NipahTV!</p>
					<h3><strong>Current Known Issues:</strong></h3>
					<ul>
					<li><strong>Reply Functionality:</strong> Kick’s overhaul made it impossible to implement the reply message feature. When replying, NipahTV falls back to the default Kick chat input as a temporary workaround.</li>
					<li><strong>Firefox Issues:</strong> Kick has historically had <b>many</b> issues with Firefox, and currently, Firefox is having trouble authenticating.</li>
					<li><strong>Mobile Mode Conflicts:</strong> Kick’s new mobile mode activates on smaller window sizes, which currently breaks NipahTV.</li>
					<li><strong>Chat Scrolling Problems:</strong> Occasionally, chat gets stuck while scrolling, particularly when large messages with a lot of emotes expand.</li>
					<li><strong>Bans/Timeouts:</strong> Banning or timing out users causes their page to crash completely.</li>
					<li><strong>Feature Restoration:</strong> Some settings, such as the transparent overlay chat in theatre mode, still need to be re-implemented into Kick’s new design.</li>
					</ul>
					<p>We are continuing to make fixes and adjustments to improve the experience and restore the features you all loved. <strong>Thank you for your patience and support</strong> as we adapt to these changes!</p>

				`
			})

			if (announcementService.hasAnnouncement('website_overhaul_sept_2024_update')) {
				setTimeout(() => {
					announcementService.displayAnnouncement('website_overhaul_sept_2024_update')
				}, 1000)
			}
		}

		rootEventBus.subscribe(
			'ntv.settings.loaded',
			() => {
				document.addEventListener('DOMContentLoaded', showAnnouncements)
				if (document.readyState === 'complete' || document.readyState === 'interactive') showAnnouncements()
			},
			true
		)
	}

	loadSettings() {
		const { settingsManager } = this.rootContext
		const { eventBus, channelData } = this.session
		const channelId = channelData.channelId

		const firstMessageHighlightColor = settingsManager.getSetting(channelId, 'chat.appearance.highlight_color')
		if (firstMessageHighlightColor) {
			const rgb = hex2rgb(firstMessageHighlightColor)
			document.documentElement.style.setProperty(
				'--ntv-background-highlight-accent-1',
				`rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.8)`
			)
		}

		eventBus.subscribe(
			'ntv.settings.change.chat.appearance.highlight_color',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				if (!value) return
				const rgb = hex2rgb(value)
				document.documentElement.style.setProperty(
					'--ntv-background-highlight-accent-1',
					`rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.8)`
				)
			}
		)
	}

	loadInputBehaviour(kickTextFieldEl: HTMLElement, kickSubmitButtonEl: HTMLElement) {
		if (!this.session.channelData.me.isLoggedIn) return
		if (this.session.channelData.isVod) return

		//////////////////////////////////////
		//====// Proxy Submit Button //====//
		Array.from(document.getElementsByClassName('ntv__submit-button')).forEach(element => {
			element.remove()
		})

		const submitButtonEl = (this.elm.submitButton = document.createElement('button'))
		submitButtonEl.classList.add('ntv__submit-button', 'disabled')
		submitButtonEl.textContent = 'Chat'

		this.elm.originalSubmitButton = kickSubmitButtonEl
		kickSubmitButtonEl.style.setProperty('display', 'none', 'important')
		kickSubmitButtonEl.after(submitButtonEl)
		// kickSubmitButtonEl.remove()

		submitButtonEl.addEventListener('click', event => this.submitButtonPriorityEventTarget.dispatchEvent(event))
		this.submitButtonPriorityEventTarget.addEventListener('click', 10, () => this.submitInput(false))

		///////////////////////////////////
		//====// Proxy Text Field //====//
		// Cleanup any remaining NTV elements from previous sessions
		Array.from(document.getElementsByClassName('ntv__message-input__wrapper')).forEach(el => el.remove())
		Array.from(document.getElementsByClassName('ntv__message-input')).forEach(el => el.remove())

		document.querySelectorAll('.ntv__message-input__wrapper').forEach(el => el.remove())
		document.querySelectorAll('.ntv__message-input').forEach(el => el.remove())

		const textFieldEl = (this.elm.textField = document.createElement('div'))
		textFieldEl.id = 'ntv__message-input'
		textFieldEl.tabIndex = 0
		textFieldEl.contentEditable = 'true'
		textFieldEl.spellcheck = true
		textFieldEl.setAttribute('placeholder', 'Send a message')
		textFieldEl.setAttribute('enterkeyhint', 'send')
		textFieldEl.setAttribute('role', 'textbox')

		const textFieldWrapperEl = parseHTML(
			`<div class="ntv__message-input__wrapper" data-char-limit="${this.maxMessageLength}"></div>`,
			true
		) as HTMLElement

		textFieldWrapperEl.append(textFieldEl)
		kickTextFieldEl.parentElement!.before(textFieldWrapperEl)
		if (document.activeElement === kickTextFieldEl) textFieldEl.focus()
		// kickTextFieldEl.parentElement!.remove()
		kickTextFieldEl?.parentElement?.style.setProperty('display', 'none', 'important')

		// Find any emote buttons after out input field
		let nextSibling = textFieldWrapperEl.nextElementSibling
		while (nextSibling) {
			if (nextSibling.tagName === 'BUTTON') {
				nextSibling.remove()
				break
			}
			nextSibling = nextSibling.nextElementSibling
		}

		// const moderatorChatIdentityBadgeIconEl = document.querySelector('.chat-input-wrapper .chat-input-icon')
		// if (moderatorChatIdentityBadgeIconEl) textFieldEl.before(moderatorChatIdentityBadgeIconEl)

		// document.getElementById('chatroom')?.classList.add('ntv__hide-chat-input')

		//////////////////////////////////////////////
		//====// Initialize input controller //====//
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
		inputController.loadInputCompletionBehaviour()
		inputController.loadChatHistoryBehaviour()
		this.loadInputStatusBehaviour()

		inputController.addEventListener('is_empty', 10, (event: CustomEvent) => {
			if (event.detail.isEmpty) {
				submitButtonEl.setAttribute('disabled', '')
				submitButtonEl.classList.add('disabled')
			} else {
				submitButtonEl.removeAttribute('disabled')
				submitButtonEl.classList.remove('disabled')
			}
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

		// // Ignore control keys that are not used for typing
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

		const hasStealFocus = () =>
			this.rootContext.settingsManager.getSetting(this.session.channelData.channelId, 'chat.input.steal_focus')

		// If started typing with focus not on chat input, focus on chat input
		document.body.addEventListener('keydown', evt => {
			if (
				evt.ctrlKey ||
				evt.altKey ||
				evt.metaKey ||
				ignoredKeys[evt.key] ||
				!hasStealFocus() ||
				inputController.isShowingInputCompletorNavListWindow() ||
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
				log('Scroll event', evt)
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
				log('Wheel event', evt)
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

		const { settingsManager, eventBus: rootEventBus } = this.rootContext
		const channelId = this.session.channelData.channelId

		// Handle changing the overlay chat setting
		const chatOverlayModeSetting = settingsManager.getSetting(channelId, 'appearance.layout.overlay_chat')
		if (chatOverlayModeSetting && chatOverlayModeSetting !== 'none') {
			waitForElements(['body > div[data-theatre]'], 10_000)
				.then(([containerEl]) => {
					containerEl.classList.add('ntv__theatre-overlay-mode')
					containerEl.classList.add(
						'ntv__theatre-overlay-mode--' + chatOverlayModeSetting.replaceAll('_', '-')
					)
				})
				.catch(() => {})
		}

		rootEventBus.subscribe(
			'ntv.settings.change.appearance.layout.overlay_chat',
			({ value, prevValue }: { value: string; prevValue?: string }) => {
				const containerEl = document.querySelector('body > div[data-theatre]')
				if (!containerEl) return error('Theatre mode container not found')

				if (prevValue) {
					containerEl.classList.remove('ntv__theatre-overlay-mode--' + prevValue.replaceAll('_', '-'))
				}

				if (value && value !== 'none') {
					containerEl.classList.add('ntv__theatre-overlay-mode')
					containerEl.classList.add('ntv__theatre-overlay-mode--' + value.replaceAll('_', '-'))
				} else {
					containerEl.classList.remove('ntv__theatre-overlay-mode')
				}
			}
		)

		const chatOverlayPositionSetting = settingsManager.getSetting(
			channelId,
			'appearance.layout.overlay_chat_position'
		)
		if (chatOverlayPositionSetting) {
			waitForElements(['body > div[data-theatre]'], 10_000)
				.then(([containerEl]) => {
					containerEl.classList.add(
						'ntv__theatre-overlay-position--' + chatOverlayPositionSetting.replaceAll('_', '-')
					)
				})
				.catch(() => {})
		}

		rootEventBus.subscribe(
			'ntv.settings.change.appearance.layout.overlay_chat_position',
			({ value, prevValue }: { value: string; prevValue?: string }) => {
				const containerEl = document.querySelector('body > div[data-theatre]')
				if (!containerEl) return error('Theatre mode container not found')

				if (prevValue) {
					containerEl.classList.remove('ntv__theatre-overlay-position--' + prevValue.replaceAll('_', '-'))
				}

				if (value && value !== 'none') {
					containerEl.classList.add('ntv__theatre-overlay-position--' + value.replaceAll('_', '-'))
				}
			}
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

	loadChatMesssageRenderingBehaviour() {
		const tps = 60
		const queue = this.queuedChatMessages

		const renderChatMessagesLoop = () => {
			const queueLength = queue.length

			if (queueLength) {
				// log('Rendering chat messages..', queueLength)

				if (queueLength > 150) {
					log('Chat message queue is too large, discarding overhead..', queueLength)
					queue.splice(queueLength - 1 - 150)
				}

				// Don't try to render many messages at once when chat is moving fast
				let messageChunkSize = 10
				if (queueLength > 100) {
					messageChunkSize = 1
				} else if (queueLength > 50) {
					messageChunkSize = 5
				}

				// Remove any messages that no longer exist in the DOM
				//  this is necessary when chat moves too fast.
				for (let i = queue.length - 1; i >= 0; i--) {
					const msgEl = queue[i]

					// If message element no longer exists, it means all messages after
					//  it have also been removed from the DOM, so we can safely
					//  splice the entire range out of the queue.
					if (!isElementInDOM(msgEl)) {
						// Take out all items from start up to index
						queue.splice(0, i)
						break
					}
				}

				// We render the newest messages first as theyre most likely to be visible
				// const queueSlice = queue.splice(queue.length - 1 - messageChunkSize)
				const queueSlice = queue.splice(0, messageChunkSize)

				for (const msgEl of queueSlice) {
					this.renderChatMessage(msgEl)
				}
			}

			setTimeout(() => requestAnimationFrame(renderChatMessagesLoop), 1000 / tps)
		}

		renderChatMessagesLoop()

		// Additional cleanup loop to keep the queue size in check
		//  when inactive tab and requestAnimationFrame never fires.
		setInterval(() => {
			const queue = this.queuedChatMessages
			if (queue.length > 150) {
				log('Chat message queue is too large, discarding overhead..', queue.length)
				queue.splice(queue.length - 1 - 150)
			}
		}, 4000)

		// Queue all existing chat messages for rendering
		const chatMessageEls = Array.from(this.elm.chatMessagesContainer?.children || [])
		if (chatMessageEls.length) {
			for (const chatMessageEl of chatMessageEls) {
				this.prepareMessageForRendering(chatMessageEl as HTMLElement)
				this.queuedChatMessages.push(chatMessageEl as HTMLElement)
			}
		}
	}

	observeChatMessages(chatMessagesContainerEl: HTMLElement) {
		const channelId = this.session.channelData.channelId

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
									this.prepareMessageForRendering(messageNode as HTMLElement)
									this.queuedChatMessages.push(messageNode)
								}
							}
							// if (this.stickyScroll) {
							// 	// We need to wait for the next frame paint call to render before scrolling to bottom
							// 	window.requestAnimationFrame(scrollToBottom)
							// }
						}
					})
				}))
				observer.observe(chatMessagesContainerEl, { childList: true })
			},
			true
		)

		// Show emote tooltip with emote name, remove when mouse leaves
		const showTooltipImage = this.rootContext.settingsManager.getSetting(channelId, 'chat.tooltips.images')
		chatMessagesContainerEl.addEventListener('mouseover', evt => {
			const target = evt.target as HTMLElement
			if (target.tagName !== 'IMG' || !target?.parentElement?.classList.contains('ntv__inline-emote-box')) return

			const emoteName = target.getAttribute('data-emote-name')
			if (!emoteName) return

			const tooltipEl = parseHTML(
				`<div class="ntv__emote-tooltip ntv__emote-tooltip--inline"><span>${emoteName}</span></div>`,
				true
			) as HTMLElement

			if (showTooltipImage) {
				const imageNode = target.cloneNode(true) as HTMLImageElement
				imageNode.className = 'ntv__emote'
				tooltipEl.prepend(imageNode)
			}

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

				if (!target.classList.contains('ntv__chat-message__username')) return

				const usernameEl = target
				const username = usernameEl?.textContent
				const rect = usernameEl.getBoundingClientRect()
				const screenPosition = { x: rect.x, y: rect.y - 100 }
				if (username) this.handleUserInfoModalClick(username, screenPosition)
			}
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
					const chatMessageElement = addedNode.closest('.ntv__chat-message')! as HTMLElement

					if (!chatMessageElement || chatMessageElement.classList.contains('ntv__chat-message--deleted'))
						return

					chatMessageElement.classList.add('ntv__chat-message--deleted')

					// For moderators Kick appends "(Deleted)"
					if (addedNode.className === 'line-through') {
						chatMessageElement.append(
							parseHTML(
								`<span class="ntv__chat-message__part ntv__chat-message--text">(Deleted)</span>`,
								true
							)
						)
					}
					// For regular viewers we need to remove the message content and replace it with "Deleted by a moderator"
					else {
						Array.from(chatMessageElement.getElementsByClassName('ntv__chat-message__part')).forEach(node =>
							node.remove()
						)

						const deletedMessageContent = addedNode.textContent || 'Deleted by a moderator'

						chatMessageElement.append(
							parseHTML(
								`<span class="ntv__chat-message__part ntv__chat-message--text">${deletedMessageContent}</span>`,
								true
							)
						)
					}
				}
			})
		})
	}

	async handleUserInfoModalClick(username: string, screenPosition?: { x: number; y: number }) {
		const userInfoModal = this.showUserInfoModal(username, screenPosition)

		const processKickUserProfileModal = async function (
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

			const [giftSubButtonSvgPath] = await waitForTargetedElements(
				kickUserInfoModalContainerEl,
				['#user-identity button path[d^="M28.75 7.5L33.75 0H23.75L20"]'],
				20_000
			)

			const giftSubButton = giftSubButtonSvgPath?.closest('button')
			if (!giftSubButton) return

			// Gift sub button already exists
			connectGiftSubButtonInModal(userInfoModal, giftSubButton)
		}

		const connectGiftSubButtonInModal = function (userInfoModal: UserInfoModal, giftSubButton: Element) {
			// Watch for gift sub button clicks on our own user info modal and forward the events to the original gift sub button
			userInfoModal.addEventListener('gift_sub_click', () => {
				const event = new MouseEvent('click', { bubbles: true, cancelable: true })
				Object.defineProperty(event, 'target', { value: giftSubButton, enumerable: true })
				giftSubButton.dispatchEvent(event)
			})

			userInfoModal.enableGiftSubButton()
		}

		const destroyKickModal = function (container: Element) {
			const closeBtnEl = container?.querySelector('& > button.absolute.select-none')!
			const event = new MouseEvent('click', { bubbles: true, cancelable: true })
			Object.defineProperty(event, 'target', { value: closeBtnEl, enumerable: true })
			closeBtnEl?.dispatchEvent(event)
			// container?.remove() // <-- Still causes Kick to break in weird ways
		}

		// Has a Kick user profile modal already been loaded? We can use it immediately then.
		const kickUserProfileCards = Array.from(document.querySelectorAll('.base-floating-card.user-profile'))
		const kickUserInfoModalContainerEl = kickUserProfileCards.find(node => findNodeWithTextContent(node, username))

		if (kickUserInfoModalContainerEl) {
			// Double check username to make sure its the right user profile modal
			const usernameEl = kickUserInfoModalContainerEl.querySelector('a[rel="noreferrer"][title]')
			const usernameElText = usernameEl?.textContent
			if (!usernameElText || username !== usernameElText) return

			processKickUserProfileModal(userInfoModal, kickUserInfoModalContainerEl as HTMLElement)
		} else {
			// To hide the Kick user profile modal faster because waitForElements is slow
			let hideModalFaster = document.getElementById('user-identity')
			if (hideModalFaster) {
				hideModalFaster.style.display = 'none'
				hideModalFaster.style.opacity = '0'
			}

			// Double check username to make sure its the right user profile modal
			const [usernameEl] = await waitForElements(['#user-identity a[rel="noreferrer"][title]'], 20_000)
			const usernameElText = usernameEl?.textContent
			if (!usernameElText || username !== usernameElText) return

			const kickUserInfoModalContainerEl = document.getElementById('user-identity')
			if (!kickUserInfoModalContainerEl) return error('Kick user profile modal container not found')

			processKickUserProfileModal(userInfoModal, kickUserInfoModalContainerEl)
		}
	}

	// observePinnedMessage(chatMessagesContainerEl: HTMLElement) {
	// 	this.session.eventBus.subscribe('ntv.providers.loaded', () => {
	// 		const observer = (this.pinnedMessageObserver = new MutationObserver(mutations => {
	// 			mutations.forEach(mutation => {
	// 				if (mutation.addedNodes.length) {
	// 					for (const node of mutation.addedNodes) {
	// 						if (node instanceof HTMLElement && node.classList.contains('pinned-message')) {
	// 							this.renderPinnedMessage(node as HTMLElement)

	// 							// Clicking on emotes in pinned message
	// 							node.addEventListener('click', evt => {
	// 								const target = evt.target as HTMLElement
	// 								if (
	// 									target.tagName === 'IMG' &&
	// 									target?.parentElement?.classList.contains('ntv__inline-emote-box')
	// 								) {
	// 									const emoteHid = target.getAttribute('data-emote-hid')
	// 									if (emoteHid) this.inputController?.contentEditableEditor.insertEmote(emoteHid)
	// 								}
	// 							})
	// 						}
	// 					}
	// 				}
	// 			})
	// 		}))

	// 		observer.observe(chatMessagesContainerEl, { childList: true, subtree: true })

	// 		const pinnedMessage = chatroomTopEl.querySelector('.pinned-message')
	// 		if (pinnedMessage) {
	// 			this.renderPinnedMessage(pinnedMessage as HTMLElement)

	// 			// Clicking on emotes in pinned message
	// 			pinnedMessage.addEventListener('click', evt => {
	// 				const target = evt.target as HTMLElement
	// 				if (
	// 					target.tagName === 'IMG' &&
	// 					target?.parentElement?.classList.contains('ntv__inline-emote-box')
	// 				) {
	// 					const emoteHid = target.getAttribute('data-emote-hid')
	// 					if (emoteHid) this.inputController?.contentEditableEditor.insertEmote(emoteHid)
	// 				}
	// 			})
	// 		}
	// 	})
	// }

	prepareMessageForRendering(messageEl: HTMLElement) {
		const settingsManager = this.rootContext.settingsManager
		const channelId = this.session.channelData.channelId

		const chatMessagesStyle = settingsManager.getSetting(channelId, 'chat.appearance.messages_style')
		const chatMessagesSpacing = settingsManager.getSetting(channelId, 'chat.appearance.messages_spacing')

		if (chatMessagesStyle && chatMessagesStyle !== 'none')
			messageEl.classList.add('ntv__chat-message--theme-' + chatMessagesStyle)

		if (chatMessagesSpacing && chatMessagesSpacing !== 'none')
			messageEl.classList.add('ntv__chat-message--' + chatMessagesSpacing)

		messageEl.classList.add('ntv__chat-message', 'ntv__chat-message--unrendered')
	}

	renderChatMessage(messageNode: HTMLElement) {
		const { settingsManager } = this.rootContext
		const { emotesManager, usersManager } = this.session
		const { channelData } = this.session
		const channelId = channelData.channelId

		/*
		  * Old Kick chat message structure:
			<div>
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
			</div>
		
		  * New Kick chat message structure
			<div class="absolute inset-0 ...">
				<div class="group relative">
					<div class="betterhover:group-hover:bg-shade-lower ..." ...>
						<div class="inline-flex" style="display: var(--chatroom-mod-actions-display);">
							<button></button> <---|| Delete message ||
							<button></button> <---|| Timeout user ||
							<button></button> <---|| Ban user ||
						</div>
						<span>02:20 PM</span>
						<div class="flex-nowrap">
							<div></div> <---|| Badges container ||
							<button title="The Username">The Username</button>
						</div>
						<span>: </span>
						<span> <---|| Chat message components ||
							<span data-emote-id="39284" data-emote-name="vibePlz">...</span>
							KEKW
						</span>
					</div>
					<div id="chat-message-actions" class="...">
						<button aria-label="Pin"></button>
						<button aria-label="Delete"></button>
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

		// Message is chatroom history breaker "----- New messages -----"
		if (!messageNode.children || !messageNode.firstElementChild!.classList.contains('group')) {
			messageNode.classList.add('ntv__chat-message')
			messageNode.classList.remove('ntv__chat-message--unrendered')

			if (messageNode.firstElementChild?.classList.contains('items-center')) {
				messageNode.classList.add('ntv__chat-message--history-breaker')
			} else {
				messageNode.classList.add('ntv__chat-message--history-breaker')
			}

			return
		}

		const ntvIdentityWrapperEl = document.createElement('div')
		ntvIdentityWrapperEl.classList.add('ntv__chat-message__identity')

		let groupElementNode: Element | null | undefined = messageNode.firstElementChild
		if (!groupElementNode?.classList.contains('group')) groupElementNode = groupElementNode?.nextElementSibling

		if (!groupElementNode?.classList.contains('group')) {
			messageNode.classList.remove('ntv__chat-message--unrendered')
			error('Chat message content wrapper node not found', messageNode)
			return
		}

		const betterHoverEl = groupElementNode.firstElementChild
		if (!betterHoverEl) {
			messageNode.classList.remove('ntv__chat-message--unrendered')
			error('Better hover element not found')
			return
		}

		let isReply = false
		if (betterHoverEl.firstElementChild?.classList.contains('w-full')) {
			isReply = true

			// Clone the reply message attachment to our chat message container
			const replyMessageAttachmentEl = betterHoverEl.firstElementChild
			if (!replyMessageAttachmentEl) {
				messageNode.classList.remove('ntv__chat-message--unrendered')
				error('Reply message attachment element not found', messageNode)
				return
			}

			const ntvReplyMessageAttachmentEl = replyMessageAttachmentEl.cloneNode(true) as HTMLElement
			ntvReplyMessageAttachmentEl.classList.add('ntv__chat-message__reply-attachment')
			messageNode.append(ntvReplyMessageAttachmentEl)
		}

		const messageBodyWrapper = isReply ? betterHoverEl.lastElementChild : betterHoverEl
		if (!messageBodyWrapper) {
			messageNode.classList.remove('ntv__chat-message--unrendered')
			error('Chat message body wrapper node not found', messageNode)
			return
		}

		// First element child might be the reply message attachment wrapper, so we get last instead
		const contentWrapperNode = messageBodyWrapper.lastElementChild
		if (!contentWrapperNode) {
			messageNode.classList.remove('ntv__chat-message--unrendered')
			error('Chat message content wrapper node not found', messageNode)
			return
		}

		let timestampEl = messageBodyWrapper.firstElementChild
		while (timestampEl && timestampEl.tagName !== 'SPAN') timestampEl = timestampEl.nextElementSibling
		if (!timestampEl) {
			messageNode.classList.remove('ntv__chat-message--unrendered')
			error('Chat message timestamp node not found', messageNode)
			return
		}

		const ntvTimestampEl = document.createElement('span')
		ntvTimestampEl.className = 'ntv__chat-message__timestamp'
		ntvTimestampEl.textContent = timestampEl.textContent || '00:00 AM'

		const identityEl = timestampEl?.nextElementSibling
		if (!identityEl) {
			messageNode.classList.remove('ntv__chat-message--unrendered')
			error('Chat message identity node not found', messageNode)
			return
		}

		const ntvBadgesEl = document.createElement('span')
		ntvBadgesEl.className = 'ntv__chat-message__badges'

		const badgesEl = identityEl.firstElementChild // Only exists if user has badges
		if (badgesEl && badgesEl.tagName !== 'BUTTON') {
			if (badgesEl.firstElementChild)
				ntvBadgesEl.append(
					...Array.from(badgesEl.children).map(badgeWrapperEl => {
						const subWrapperEl = badgeWrapperEl.firstElementChild
						const svgEl = subWrapperEl?.firstElementChild
						svgEl?.setAttribute('class', 'ntv__badge')
						subWrapperEl?.setAttribute('class', 'ntv__chat-message__badge')
						return subWrapperEl || badgeWrapperEl
					})
				)
		}

		let usernameEl = (
			identityEl.childNodes.length > 1 ? identityEl.children[1] : identityEl.firstElementChild
		) as HTMLElement
		while (usernameEl && usernameEl.tagName !== 'BUTTON') usernameEl = usernameEl.nextElementSibling as HTMLElement
		if (!usernameEl) {
			messageNode.classList.remove('ntv__chat-message--unrendered')
			error('Chat message username node not found', messageNode)
			return
		}

		const username = usernameEl.title
		const ntvUsernameEl = document.createElement('span')
		ntvUsernameEl.className = 'ntv__chat-message__username'
		ntvUsernameEl.title = username
		ntvUsernameEl.textContent = usernameEl.textContent || 'Unknown user'
		ntvUsernameEl.style.color = usernameEl.style.color

		if (!channelData.isVod && username) {
			if (usersManager.hasMutedUser(username)) {
				return
			}

			if (!usersManager.hasSeenUser(username)) {
				const enableFirstMessageHighlight = settingsManager.getSetting(
					channelId,
					'chat.appearance.highlight_first_message'
				)
				const highlightWhenModeratorOnly = settingsManager.getSetting(
					channelId,
					'chat.appearance.highlight_first_message_moderator'
				)
				if (
					enableFirstMessageHighlight &&
					(!highlightWhenModeratorOnly || (highlightWhenModeratorOnly && channelData.me.isModerator))
				) {
					messageNode.classList.add('ntv__chat-message--first-message')
				}

				// TODO It's not great, but we dont have slug or user ID here anymore
				usersManager.registerUser(username, username)
			}
		}

		const separatorEl = identityEl?.nextElementSibling
		if (!separatorEl || !separatorEl.hasAttribute('aria-hidden')) {
			messageNode.classList.remove('ntv__chat-message--unrendered')
			error('Chat message separator node not found', separatorEl)
			return
		}
		const ntvSeparatorEl = document.createElement('span')
		ntvSeparatorEl.className = 'ntv__chat-message__separator'
		ntvSeparatorEl.textContent = ': '

		// Add NTV badge to badges container
		if (settingsManager.getSetting(channelId, 'chat.badges.show_ntv_badge')) {
			// Check if message has been signed by NTV
			const lastChildNode = contentWrapperNode.lastChild
			if (lastChildNode?.textContent?.endsWith(U_TAG_NTV_AFFIX)) {
				// Kick normally adds a margin-right tailwind class when container is no longer empty so we simulate it
				// if (!badgesContainer.children.length) badgesContainer.classList.add('mr-1')

				const badgeEl = parseHTML(
					this.session.badgeProvider.getBadge({ type: 'nipahtv' } as Badge) as string,
					true
				) as HTMLElement

				ntvBadgesEl.append(badgeEl)
			}
		}

		ntvIdentityWrapperEl.append(ntvTimestampEl, ntvBadgesEl, ntvUsernameEl, ntvSeparatorEl)

		const messagePartNodes = []

		// const messageBodyChildren = Array.from(contentWrapperNode.childNodes)
		for (const contentNode of contentWrapperNode.childNodes) {
			// const newContentNode = document.createElement('span')
			// newContentNode.classList.add('ntv__chat-message__part')
			// newContentNode.textContent =
			// 	'AD ASDA ASDDADDSA ASD ADASDAS DSAD ASD ASD ASD ASDASASDSA ASD ASD ASDAS ASDASD ASD ASDASD AASD DSAA DASD SADSA ASD ASD ASD ASD SD ASD AS AD ASDA ASDDADDSA ASD ADASDAS DSAD ASD ASD ASD ASDASASDSA ASD ASD ASDAS ASDASD ASD ASDASD AASD DSAA DASD SADSA ASD ASD ASD ASD SD ASD AS'
			// messagePartNodes.push(newContentNode)

			if (contentNode.nodeType === Node.TEXT_NODE) {
				const parsedEmoteNotes = this.renderEmotesInString(contentNode.textContent || '')
				messagePartNodes.push(...parsedEmoteNotes)
				// ntvChatMessageEl.append(...parsedEmoteNotes)
			}
			// @ts-ignore
			else if (contentNode instanceof HTMLElement && contentNode!.tagName === 'SPAN') {
				// Unwrap and clean up native Kick emotes
				const imgEl = contentNode.firstElementChild?.firstElementChild
				if (!imgEl || imgEl instanceof HTMLImageElement === false) {
					error('Emote image element not found', imgEl)
					continue
				}
				const ntvImgEl = document.createElement('img')
				ntvImgEl.src = imgEl.src

				const emoteId = contentNode.getAttribute('data-emote-id')
				const emoteName = contentNode.getAttribute('data-emote-name')
				if (!emoteId || !emoteName) {
					error('Emote ID or name not found', contentNode)
					continue
				}

				// imgEl.removeAttribute('class')
				ntvImgEl.setAttribute('data-emote-name', emoteName)

				const emote = emotesManager.getEmoteById(emoteId)
				if (emote) {
					ntvImgEl.setAttribute('data-emote-id', emote.hid)
				}

				const newContentNode = document.createElement('span')
				newContentNode.classList.add('ntv__chat-message__part', 'ntv__inline-emote-box')
				newContentNode.setAttribute('contenteditable', 'false')
				newContentNode.appendChild(ntvImgEl)
				messagePartNodes.push(newContentNode)
			} else {
				const newContentNode = document.createElement('span')
				newContentNode.classList.add('ntv__chat-message__part')
				newContentNode.appendChild(contentNode.cloneNode(true))
				messagePartNodes.push(newContentNode)
			}
		}

		;(groupElementNode as HTMLElement).style.display = 'none'

		// Append all the nodes to our own chat message container
		// We do this late so checks can be done and bailout early
		//   if necessary leaving the original message untouched
		// messageNode.append(ntvChatMessageEl)
		messageNode.append(ntvIdentityWrapperEl)
		messageNode.append(...messagePartNodes)

		messageNode.classList.add('ntv__chat-message')
		// messageNode.style.removeProperty('display')
		messageNode.classList.remove('ntv__chat-message--unrendered')

		// Pull out the chat message actions
		let chatMessageActionsEl = groupElementNode.lastElementChild
		while (chatMessageActionsEl && chatMessageActionsEl.id !== 'chat-message-actions')
			chatMessageActionsEl = chatMessageActionsEl.previousElementSibling
		if (chatMessageActionsEl) {
			// chatMessageActionsEl.removeAttribute('id')
			// chatMessageActionsEl.classList.add('kick__chat-message__actions')

			const ntvChatMessageActionsEl = document.createElement('div')
			ntvChatMessageActionsEl.className = chatMessageActionsEl.className
			ntvChatMessageActionsEl.classList.add('kick__chat-message__actions')
			ntvChatMessageActionsEl.classList.remove('hidden')

			// Hide the reply button because it doesnt work yet
			const replyButtonEl =
				chatMessageActionsEl.querySelector('[d*="M18.64 8.82996H"]')?.parentElement?.parentElement
			if (replyButtonEl) replyButtonEl.classList.add('kick__reply-button')

			// We clone the buttons and attach new event listeners to forward the click events to the original buttons
			for (const buttonEl of chatMessageActionsEl.children) {
				// if (buttonEl.classList.contains('kick__reply-button')) continue

				const ntvBtnEl = buttonEl.cloneNode(true)
				ntvBtnEl.addEventListener('click', evt => {
					evt.preventDefault()
					evt.stopPropagation()
					evt.stopImmediatePropagation()

					if (evt.target instanceof HTMLElement && evt.target.classList.contains('kick__reply-button')) {
						log('Reply button clicked', evt.target, ntvBtnEl)
						this.handleUglyTemporaryReplyBehaviour()
					}

					const event = new MouseEvent('click', { bubbles: true, cancelable: true })
					Object.defineProperty(event, 'target', { writable: false, value: buttonEl })
					buttonEl.dispatchEvent(event)
				})
				ntvChatMessageActionsEl.append(ntvBtnEl)
			}

			messageNode.append(ntvChatMessageActionsEl)
		}

		// Forward event to Kick's original username element
		ntvUsernameEl.addEventListener('click', evt => {
			const event = new MouseEvent('click', { bubbles: true, cancelable: false })
			Object.defineProperty(event, 'target', { value: usernameEl, enumerable: true })
			usernameEl.dispatchEvent(event)
		})

		// Observe class changes to detect when message is deleted
		this.deletedChatEntryObserver?.observe(contentWrapperNode, {
			childList: true,
			attributes: false,
			subtree: false
		})

		// Adding this class removes the display: none from the chat message, causing a reflow
		// messageNode.classList.add('ntv__chat-message__wrapper')
	}

	async handleUglyTemporaryReplyBehaviour() {
		// Because there's no message IDs in DOM it's impossible to handle reply message behaviour properly
		//  so we have to do this ugly temporary solution where we restore the original Kick text field.
		// This is only temporary until we have fully implemented our own chat message system.
		const textFieldEl = this.elm.textField!
		const originalTextFieldEl = document.querySelector('.editor-input[contenteditable="true"]')

		textFieldEl.parentElement!.style.display = 'none'
		originalTextFieldEl?.parentElement?.style.removeProperty('display')

		this.elm.submitButton!.style.setProperty('display', 'none', 'important')
		this.elm.originalSubmitButton!.style.removeProperty('display')

		await waitForElements(['.kick__chat-footer path[d*="M28 6.99204L25.008 4L16"]'], 2_000)

		const closeReplyButton = document
			.querySelector('.kick__chat-footer path[d*="M28 6.99204L25.008 4L16"]')
			?.closest('button')!

		const replyPreviewWrapperEl = closeReplyButton.closest('.flex.flex-col')?.parentElement
		if (!replyPreviewWrapperEl) return error('Reply preview wrapper element not found')

		// Attach observer to reply message button to detect when the element is removed
		//  so we know the reply message has been closed and we can restore the text field.
		const observer = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				if (mutation.removedNodes.length) {
					originalTextFieldEl!.parentElement!.style.display = 'none'
					textFieldEl.parentElement!.style.removeProperty('display')
					this.elm.submitButton!.style.removeProperty('display')
					this.elm.originalSubmitButton!.style.setProperty('display', 'none', 'important')
					observer.disconnect()
				}
			})
		})
		observer.observe(replyPreviewWrapperEl, { childList: true })
	}

	renderPinnedMessage(node: HTMLElement) {
		this.queuedChatMessages.push(node)
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
