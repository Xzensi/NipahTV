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
import DOMEventManager from '../Managers/DOMEventManager'
import InputController from '../Classes/InputController'
import type UserInfoModal from './Modals/UserInfoModal'
import type { Badge } from '../Providers/BadgeProvider'
import { PROVIDER_ENUM, U_TAG_NTV_AFFIX } from '../constants'
import { Caret } from './Caret'

export class KickUserInterface extends AbstractUserInterface {
	private abortController = new AbortController()
	private domEventManager = new DOMEventManager()

	private chatObserver: MutationObserver | null = null
	private deletedChatEntryObserver: MutationObserver | null = null
	private replyObserver: MutationObserver | null = null
	private pinnedMessageObserver: MutationObserver | null = null
	private emoteMenu: EmoteMenuComponent | null = null
	private emoteMenuButton: EmoteMenuButtonComponent | null = null
	private quickEmotesHolder: QuickEmotesHolderComponent | null = null
	private clearQueuedChatMessagesInterval: NodeJS.Timeout | null = null
	private reloadUIhackInterval: NodeJS.Timeout | null = null

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

		if (channelData.isModView || channelData.isCreatorView) {
			// Wait for text input & submit button to load
			waitForElements(['#message-input', '#chatroom-footer .send-row > button'], 10_000, abortSignal)
				.then(foundElements => {
					if (this.session.isDestroyed) return

					const [textFieldEl, submitButtonEl] = foundElements as HTMLElement[]
					this.loadInputBehaviour(textFieldEl, submitButtonEl)
					this.loadEmoteMenu()
				})
				.catch(() => {})

			// Wait for chat footer to load
			waitForElements(['#chatroom-footer'], 10_000, abortSignal)
				.then(foundElements => {
					if (this.session.isDestroyed) return

					const [footerEl] = foundElements as HTMLElement[]
					footerEl.classList.add('kick__chat-footer')

					// Initialize a container for the timers UI
					const timersContainer = document.createElement('div')
					timersContainer.id = 'ntv__timers-container'
					footerEl.append(timersContainer)
					this.elm.timersContainer = timersContainer

					const quickEmotesHolderEl = footerEl.querySelector('& > .quick-emotes-holder') as HTMLElement
					this.loadQuickEmotesHolder(footerEl, quickEmotesHolderEl)

					waitForElements(['#chatroom-footer .send-row'], 10_000, abortSignal)
						.then(foundElements => {
							if (this.session.isDestroyed) return

							const [footerBottomBarEl] = foundElements as HTMLElement[]
							this.loadEmoteMenuButton(footerBottomBarEl)
						})
						.catch(() => {})
				})
				.catch(() => {})

			// Wait for chat messages container to load
			waitForElements(['#chatroom-top + div.overflow-hidden > .overflow-x-hidden'], 10_000, abortSignal)
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

					if (settingsManager.getSetting(channelId, 'chat.behavior.smooth_scrolling')) {
						chatMessagesContainerEl.classList.add('ntv__smooth-scrolling')
					}

					this.domEventManager.addEventListener(chatMessagesContainerEl, 'copy', evt => {
						this.clipboard.handleCopyEvent(evt as ClipboardEvent)
					})

					// Render emotes in chat when providers are loaded
					eventBus.subscribe('ntv.providers.loaded', this.loadChatMesssageRenderingBehaviour.bind(this), true)

					// TODO due overhaul
					this.observeChatMessages(chatMessagesContainerEl)
					// this.loadScrollingBehaviour()

					if (channelData.isVod) {
						this.loadVodBehaviour()
					} else {
						// this.observePinnedMessage()
						this.observeChatEntriesForDeletionEvents()
					}

					this.applyModViewFixes()
				})
				.catch(() => {})
		} else {
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

					const quickEmotesHolderEl = footerEl.querySelector('& > .overflow-hidden') as HTMLElement
					this.loadQuickEmotesHolder(footerEl, quickEmotesHolderEl)

					waitForElements(
						[`${footerSelector} > div.flex > .flex.items-center > .items-center`],
						10_000,
						abortSignal
					)
						.then(foundElements => {
							if (this.session.isDestroyed) return

							const [footerBottomBarEl] = foundElements as HTMLElement[]
							this.loadEmoteMenuButton(footerBottomBarEl)
						})
						.catch(() => {})
				})
				.catch(() => {})

			const chatMessagesContainerSelector = '#chatroom-messages > .no-scrollbar'

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

					if (settingsManager.getSetting(channelId, 'chat.behavior.smooth_scrolling')) {
						chatMessagesContainerEl.classList.add('ntv__smooth-scrolling')
					}

					this.domEventManager.addEventListener(chatMessagesContainerEl, 'copy', evt => {
						this.clipboard.handleCopyEvent(evt as ClipboardEvent)
					})

					// Render emotes in chat when providers are loaded
					eventBus.subscribe('ntv.providers.loaded', this.loadChatMesssageRenderingBehaviour.bind(this), true)

					// TODO due overhaul
					this.observeChatMessages(chatMessagesContainerEl)
					// this.loadScrollingBehaviour()

					if (channelData.isVod) {
						this.loadVodBehaviour()
					} else {
						this.observePinnedMessage()
						this.observeChatEntriesForDeletionEvents()
					}
				})
				.catch(() => {})

			// Wait for video player and chat messages container to load
			waitForElements(['#video-player', chatMessagesContainerSelector], 10_000, abortSignal)
				.then(foundElements => {
					if (this.session.isDestroyed) return

					this.loadTheatreModeBehaviour()
				})
				.catch(() => {})
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

		// Show moderator quick actions on chat messages
		rootEventBus.subscribe(
			'ntv.settings.change.moderators.chat.show_quick_actions',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				Array.from(document.getElementsByClassName('ntv__chat-message')).forEach((el: Element) => {
					el.classList.toggle('ntv__chat-message--show-quick-actions', !!value)
				})
			}
		)

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

		rootEventBus.subscribe(
			'ntv.settings.change.moderators.chat.show_quick_actions',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				//* Not respecting chatroomContainerSelector on purpose here because vods reverse the order of chat messages resulting in alternating background not working as expected
				document
					.querySelector('.ntv__chat-messages-container')
					?.classList.toggle('ntv__alternating-background', !!value)
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
				if (prevValue !== 'none') {
					const oldClassName = `ntv__chat-message--seperator-${prevValue}`
					document.querySelector('.' + oldClassName)?.classList.remove(oldClassName)
				}
				if (!value || value === 'none') return
				const newClassName = `ntv__chat-message--seperator-${value}`
				document.querySelector('.' + newClassName)?.classList.add(newClassName)
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

		const footerSubmitButtonWrapper = kickFooterBottomBarEl
		if (!footerSubmitButtonWrapper) return error('Footer submit button wrapper not found for emote menu button')

		footerSubmitButtonWrapper.prepend(placeholder)
		this.emoteMenuButton = new EmoteMenuButtonComponent(this.rootContext, this.session, placeholder).init()

		// Temporary hack to detect when our elements got removed
		//  so we can reload the session to reinitialize the UI.
		this.reloadUIhackInterval = setInterval(() => {
			if (!this.emoteMenuButton!.element.isConnected) {
				info('Emote menu button got removed. Reloading session to reinitialize UI.')
				this.destroy()
				//! Does not respect multiple sessions framework structure
				this.rootContext.eventBus.publish('ntv.reload_sessions')
			}
		}, 700)
	}

	async loadQuickEmotesHolder(kickFooterEl: HTMLElement, kickQuickEmotesHolderEl?: HTMLElement) {
		const { settingsManager, eventBus: rootEventBus } = this.rootContext
		const { channelData } = this.session
		const { channelId } = channelData
		const quickEmotesHolderEnabled = settingsManager.getSetting(channelId, 'quick_emote_holder.enabled')

		if (quickEmotesHolderEnabled) {
			const placeholder = document.createElement('div')
			kickFooterEl.prepend(placeholder)
			kickQuickEmotesHolderEl?.style.setProperty('display', 'none', 'important')
			this.quickEmotesHolder = new QuickEmotesHolderComponent(this.rootContext, this.session, placeholder).init()
		}

		rootEventBus.subscribe('ntv.settings.change.quick_emote_holder.enabled', ({ value, prevValue }: any) => {
			this.quickEmotesHolder?.destroy()

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
			/**
			 * Previously used announcement IDs
			 * - website_overhaul_sept_2024
			 * - website_overhaul_sept_2024_update
			 * -
			 */
			// announcementService.registerAnnouncement({
			// 	id: 'discord_community_server_launch',
			// 	dateTimeRange: [new Date(1727595396025)],
			// 	message: `
			// 		<p>🚀 <strong>NipahTV is Taking Off—Thanks to You!</strong> 🚀</p>
			// 		<p>It's been a short while now since the humble beginning of this project. At first it was just for our little community because when we joined Kick the chatting experience was very lackluster, so I decided to take it upon myself to do it better. Back then we had no expectations of ever growing big and it was simply a passion project to improve our own lives on the Kick plaform.</p>
			// 		<p>We had a slow and steady growth, but over the last few days, since the new Kick website launch, we've suddenly exploded in popularity! Our install count has skyrocketed, and we’re beyond excited to welcome so many new users! 👋</p>
			// 		<p>You’ve likely noticed that the new Kick update has broken a lot of things, but rest assured—we’re working hard to get everything in working order again and bring you new features to make NipahTV even better.</p>
			// 		<p>Lastly, our brand-new Discord community server is live, and we'd love to invite you! Swing by to say hi and help shape NipahTV by sharing feedback and voting on the features you want to see next.</p>
			// 		<p>Discord link: <a href="https://discord.gg/KZZZYM6ESs">NipahTV Discord server</a></p>
			// 	`
			// })
			// if (announcementService.hasAnnouncement('discord_community_server_launch')) {
			// 	setTimeout(() => {
			// 		announcementService.displayAnnouncement('discord_community_server_launch')
			// 	}, 1000)
			// }
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
		// kickSubmitButtonEl.style.setProperty('display', 'none', 'important')
		kickSubmitButtonEl.before(submitButtonEl)
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

		const { isModView, isCreatorView } = this.session.channelData
		if (isModView || isCreatorView) {
			kickTextFieldEl!.before(textFieldWrapperEl)
			if (document.activeElement === kickTextFieldEl) textFieldEl.focus()
			// kickTextFieldEl!.remove()
			// kickTextFieldEl?.style.setProperty('display', 'none', 'important')
		} else {
			kickTextFieldEl.parentElement!.before(textFieldWrapperEl)
			if (document.activeElement === kickTextFieldEl) textFieldEl.focus()
			// kickTextFieldEl.parentElement!.remove()
			// kickTextFieldEl?.parentElement?.style.setProperty('display', 'none', 'important')
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

		// If started typing with focus not on chat input, focus on chat input
		if (!this.session.channelData.isVod) {
			const hasStealFocus = () =>
				this.rootContext.settingsManager.getSetting(
					this.session.channelData.channelId,
					'chat.input.steal_focus'
				)

			this.domEventManager.addEventListener(document.body, 'keydown', (evt: KeyboardEvent) => {
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
	}

	loadScrollingBehaviour() {
		const chatMessagesContainerEl = this.elm.chatMessagesContainer
		if (!chatMessagesContainerEl) return error('Chat messages container not loaded for scrolling behaviour')

		// Scroll is sticky by default
		if (this.stickyScroll) chatMessagesContainerEl.parentElement?.classList.add('ntv__sticky-scroll')

		// Enable sticky scroll when user scrolls to bottom
		this.domEventManager.addEventListener(
			chatMessagesContainerEl,
			'scroll',
			evt => {
				// log('Scroll event', evt)
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
		this.domEventManager.addEventListener(
			chatMessagesContainerEl,
			'wheel',
			evt => {
				// log('Wheel event', evt)
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
					containerEl.classList.add('ntv__theatre-overlay__mode')
					containerEl.classList.add(
						'ntv__theatre-overlay__mode--' + chatOverlayModeSetting.replaceAll('_', '-')
					)
				})
				.catch(() => {})
		}

		rootEventBus.subscribe(
			'ntv.settings.change.appearance.layout.overlay_chat',
			({ value, prevValue }: { value: string; prevValue?: string }) => {
				const containerEl = document.querySelector('body > div[data-theatre]')
				if (!containerEl) return error('Theatre mode container not found')

				if (prevValue && prevValue !== 'none') {
					containerEl.classList.remove('ntv__theatre-overlay__mode--' + prevValue.replaceAll('_', '-'))
				}

				if (value && value !== 'none') {
					containerEl.classList.add('ntv__theatre-overlay__mode')
					containerEl.classList.add('ntv__theatre-overlay__mode--' + value.replaceAll('_', '-'))
				} else {
					containerEl.classList.remove('ntv__theatre-overlay__mode')
				}
			}
		)

		const videoAlignmentModeSetting = settingsManager.getSetting(
			channelId,
			'appearance.layout.overlay_chat.video_alignment'
		)
		if (videoAlignmentModeSetting && videoAlignmentModeSetting !== 'none') {
			waitForElements(['body > div[data-theatre]'], 10_000)
				.then(([containerEl]) => {
					containerEl.classList.add(
						'ntv__theatre-overlay__video-alignment--' + videoAlignmentModeSetting.replaceAll('_', '-')
					)
				})
				.catch(() => {})
		}

		rootEventBus.subscribe(
			'ntv.settings.change.appearance.layout.overlay_chat.video_alignment',
			({ value, prevValue }: { value: string; prevValue?: string }) => {
				const containerEl = document.querySelector('body > div[data-theatre]')
				if (!containerEl) return error('Theatre container not found')

				if (prevValue && prevValue !== 'none') {
					containerEl.classList.remove(
						'ntv__theatre-overlay__video-alignment--' + prevValue.replaceAll('_', '-')
					)
				}

				if (value && value !== 'none') {
					containerEl.classList.add('ntv__theatre-overlay__video-alignment--' + value.replaceAll('_', '-'))
				}
			}
		)

		const chatOverlayPositionSetting = settingsManager.getSetting(
			channelId,
			'appearance.layout.overlay_chat.position'
		)
		if (chatOverlayPositionSetting) {
			waitForElements(['body > div[data-theatre]'], 10_000)
				.then(([containerEl]) => {
					containerEl.classList.add(
						'ntv__theatre-overlay__position--' + chatOverlayPositionSetting.replaceAll('_', '-')
					)
				})
				.catch(() => {})
		}

		rootEventBus.subscribe(
			'ntv.settings.change.appearance.layout.overlay_chat.position',
			({ value, prevValue }: { value: string; prevValue?: string }) => {
				const containerEl = document.querySelector('body > div[data-theatre]')
				if (!containerEl) return error('Theatre container not found')

				if (prevValue && prevValue !== 'none') {
					containerEl.classList.remove('ntv__theatre-overlay__position--' + prevValue.replaceAll('_', '-'))
				}

				if (value && value !== 'none') {
					containerEl.classList.add('ntv__theatre-overlay__position--' + value.replaceAll('_', '-'))
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
					messageChunkSize = 3
				} else if (queueLength > 50) {
					messageChunkSize = 6
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
		this.clearQueuedChatMessagesInterval = setInterval(() => {
			const queue = this.queuedChatMessages
			if (queue.length > 150) {
				log('Chat message queue is too large, discarding overhead..', queue.length)
				queue.splice(queue.length - 1 - 150)
			}
		}, 4000)

		this.addExistingMessagesToQueue()
	}

	addExistingMessagesToQueue() {
		const enableChatRendering = this.rootContext.settingsManager.getSetting(
			this.session.channelData.channelId,
			'chat.behavior.enable_chat_rendering'
		)
		if (!enableChatRendering) return

		// Queue all existing chat messages for rendering
		const chatMessageEls = Array.from(this.elm.chatMessagesContainer?.children || [])
		if (chatMessageEls.length) {
			for (const chatMessageEl of chatMessageEls) {
				// if (
				// 	chatMessageEl.classList.contains('ntv__chat-message') ||
				// 	chatMessageEl.classList.contains('ntv__chat-message--unrendered')
				// )
				// 	continue
				this.prepareMessageForRendering(chatMessageEl as HTMLElement)
				this.queuedChatMessages.push(chatMessageEl as HTMLElement)
			}
		}
	}

	observeChatMessages(chatMessagesContainerEl: HTMLElement) {
		const channelId = this.session.channelData.channelId
		const settingsManager = this.rootContext.settingsManager
		const channelData = this.session.channelData

		const scrollToBottom = () => (chatMessagesContainerEl.scrollTop = 99999)

		const loadObserver = () => {
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
		}

		const enableChatRendering = settingsManager.getSetting(channelId, 'chat.behavior.enable_chat_rendering')
		if (enableChatRendering) {
			this.session.eventBus.subscribe('ntv.providers.loaded', () => loadObserver(), true)
		}

		this.rootContext.eventBus.subscribe(
			'ntv.settings.change.chat.behavior.enable_chat_rendering',
			({ value }: any) => {
				if (this.chatObserver) {
					this.chatObserver.disconnect()
					this.chatObserver = null
				}

				if (value) loadObserver()
			}
		)

		// Show emote tooltip with emote name, remove when mouse leaves
		const showTooltipImage = this.rootContext.settingsManager.getSetting(channelId, 'chat.tooltips.images')
		this.domEventManager.addEventListener(
			chatMessagesContainerEl,
			'mouseover',
			(evt: MouseEvent) => {
				const target = evt.target as HTMLElement
				if (target.tagName !== 'IMG' || !target?.parentElement?.classList.contains('ntv__inline-emote-box'))
					return

				const emoteName = target.getAttribute('data-emote-name')
				if (!emoteName) return

				const tooltipEl = parseHTML(
					`<div class="ntv__emote-tooltip"><span class="ntv__emote-tooltip__title">${emoteName}</span></div>`,
					true
				) as HTMLElement

				const emote = this.session.emotesManager.getEmoteByName(emoteName)
				if (emote && emote.isZeroWidth) {
					const span = document.createElement('span')
					span.className = 'ntv__emote-tooltip__zero-width'
					span.textContent = 'Zero Width'
					tooltipEl.appendChild(span)
				}

				if (showTooltipImage) {
					const imageNode = target.cloneNode(true) as HTMLImageElement
					imageNode.className = 'ntv__emote'
					tooltipEl.prepend(imageNode)
				}

				const rect = target.getBoundingClientRect()
				tooltipEl.style.left = `${rect.x + rect.width / 2}px`
				tooltipEl.style.top = `${rect.y}px`
				document.body.append(tooltipEl)

				target.addEventListener(
					'mouseleave',
					() => {
						tooltipEl.remove()
					},
					{ once: true, passive: true }
				)
			},
			{ passive: true }
		)

		this.domEventManager.addEventListener(chatMessagesContainerEl, 'click', (evt: MouseEvent) => {
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

				// Disable user info modal for mod and creator view
				//  because it uses old Kick design and is too broken
				//  to bother fixing.
				if (channelData.isModView || channelData.isCreatorView) return

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
		const channelData = this.session.channelData
		if (!channelData.isModView && !channelData.isCreatorView) {
			this.deletedChatEntryObserver = new MutationObserver(mutations => {
				mutations.forEach(mutation => {
					if (mutation.addedNodes.length && mutation.addedNodes[0] instanceof HTMLElement) {
						const addedNode = mutation.addedNodes[0]
						const chatMessageElement = addedNode.closest('.ntv__chat-message')! as HTMLElement

						if (!chatMessageElement || chatMessageElement.classList.contains('ntv__chat-message--deleted'))
							return

						chatMessageElement.classList.add('ntv__chat-message--deleted')

						const chatMessageInnerEl = chatMessageElement.querySelector('& > .ntv__chat-message__inner')!

						// For moderators Kick appends "(Deleted)"
						if (addedNode.className === 'line-through') {
							chatMessageInnerEl.append(
								parseHTML(`<span class="ntv__chat-message__part">(Deleted)</span>`, true)
							)
						}
						// For regular viewers we need to remove the message content and replace it with "Deleted by a moderator"
						else {
							Array.from(chatMessageElement.getElementsByClassName('ntv__chat-message__part')).forEach(
								node => node.remove()
							)

							const deletedMessageContent = addedNode.textContent || 'Deleted by a moderator'

							chatMessageInnerEl.append(
								parseHTML(`<span class="ntv__chat-message__part">${deletedMessageContent}</span>`, true)
							)
						}
					}
				})
			})
		}
		// Mod and creators view still use old Kick design
		else {
			this.deletedChatEntryObserver = new MutationObserver(mutations => {
				mutations.forEach(mutation => {
					if (mutation.addedNodes.length && mutation.addedNodes[0] instanceof HTMLElement) {
						const addedNode = mutation.addedNodes[0]
						const chatEntryNode = addedNode.closest('.chat-entry')! as HTMLElement
						if (!chatEntryNode.classList.contains('deleted-message-admin')) return

						// TODO add back the orange deleted by AI automod badge
						chatEntryNode.parentElement!.classList.add('ntv__chat-message--deleted')

						const innerWrapperEl = chatEntryNode.querySelector('.ntv__chat-message__inner')
						if (!innerWrapperEl) return error('Inner wrapper element not found')

						const channelDataMe = this.session.channelData.me
						if (channelDataMe.isBroadcaster || channelDataMe.isModerator || channelDataMe.isSuperAdmin) {
							innerWrapperEl.append(parseHTML(`<span class="ntv__chat-message__part"> (Deleted)</span>`))
						} else {
							Array.from(chatEntryNode.getElementsByClassName('ntv__chat-message__part')).forEach(node =>
								node.remove()
							)

							const deletedMessageContent = addedNode.textContent || 'Deleted by a moderator'
							innerWrapperEl.append(
								parseHTML(`<span class="ntv__chat-message__part">${deletedMessageContent}</span>`)
							)
						}
					}
				})
			})
		}
	}

	loadVodBehaviour() {
		log('Loading VOD behaviour..')

		const chatroomParentContainerEl = document
			.getElementById('channel-chatroom')
			?.querySelector('& > .bg-surface-lower')
		if (!chatroomParentContainerEl) return error('Chatroom container not found')

		this.addExistingMessagesToQueue()

		// The chatroom messages wrapper gets deleted when scrubbing the video player
		//  so we observe it and reload the chat UI when it gets re-added.
		const observer = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				if (mutation.addedNodes.length) {
					for (const node of mutation.addedNodes) {
						if (node instanceof HTMLElement && node.firstElementChild?.id === 'chatroom-messages') {
							log('New chatroom messages container found, reloading chat UI..')

							const chatroomContainerEl = node.firstElementChild.querySelector('& > .no-scrollbar')
							this.chatObserver?.disconnect()
							this.observeChatMessages(chatroomContainerEl as HTMLElement)
						}
					}
				}
			})
		})

		observer.observe(chatroomParentContainerEl, { childList: true })
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

	observePinnedMessage() {
		const pinnedMessageContainerEl = document
			.getElementById('channel-chatroom')
			?.querySelector(
				'& > .bg-surface-lower > .bg-surface-lower > .empty\\:hidden > .empty\\:hidden'
			) as HTMLElement
		if (!pinnedMessageContainerEl) return error('Pinned message container not found for observation')

		const renderPinnedMessageBody = (contentBodyEl: HTMLElement) => {
			// Cleanup old pinned messages
			Array.from(document.getElementsByClassName('ntv__pinned-message__content')).forEach(node => {
				node.remove()
			})

			this.renderPinnedMessageContent(contentBodyEl as HTMLElement)
		}

		this.session.eventBus.subscribe('ntv.providers.loaded', () => {
			const observer = (this.pinnedMessageObserver = new MutationObserver(mutations => {
				for (const mutation of mutations) {
					if (mutation.type === 'characterData') {
						if (mutation.target.parentElement?.classList.contains('[&>a:hover]:text-primary')) {
							const contentBodyEl = mutation.target.parentElement
							renderPinnedMessageBody(contentBodyEl)
							return
						}
					} else if (mutation.addedNodes.length) {
						for (const node of mutation.addedNodes) {
							if (node instanceof HTMLElement && node.classList.contains('z-absolute')) {
								const contentBodyEl = node.querySelector('.\\[\\&\\>a\\:hover\\]\\:text-primary')
								if (!contentBodyEl) return

								renderPinnedMessageBody(contentBodyEl as HTMLElement)
								return
							} else if (node.parentElement?.classList.contains('[&>a:hover]:text-primary')) {
								renderPinnedMessageBody(node.parentElement)
								return
							}
						}
					}
				}
			}))

			observer.observe(pinnedMessageContainerEl, { childList: true, subtree: true, characterData: true })

			const pinnedMessageContent = document
				.getElementById('channel-chatroom')
				?.querySelector(
					'& > .bg-surface-lower > .bg-surface-lower > .empty\\:hidden > .empty\\:hidden .\\[\\&\\>a\\:hover\\]\\:text-primary'
				)
			if (pinnedMessageContent) this.renderPinnedMessageContent(pinnedMessageContent as HTMLElement)
		})

		// Clicking on emotes in pinned message
		this.domEventManager.addEventListener(pinnedMessageContainerEl, 'click', evt => {
			const target = evt.target as HTMLElement
			if (target.tagName === 'IMG' && target?.parentElement?.classList.contains('ntv__inline-emote-box')) {
				const emoteHid = target.getAttribute('data-emote-hid')
				if (emoteHid) this.inputController?.contentEditableEditor.insertEmote(emoteHid)
			}
		})
	}

	prepareMessageForRendering(messageEl: HTMLElement) {
		const settingsManager = this.rootContext.settingsManager
		const channelData = this.session.channelData
		const channelId = channelData.channelId

		const settingStyle = settingsManager.getSetting(channelId, 'chat.appearance.messages_style')
		const settingSeperator = settingsManager.getSetting(channelId, 'chat.appearance.seperators')
		const settingSpacing = settingsManager.getSetting(channelId, 'chat.appearance.messages_spacing')

		if (settingStyle && settingStyle !== 'none') messageEl.classList.add('ntv__chat-message--theme-' + settingStyle)

		if (settingSeperator && settingSeperator !== 'none')
			messageEl.classList.add(`ntv__chat-message--seperator-${settingSeperator}`)

		if (settingSpacing && settingSpacing !== 'none') messageEl.classList.add('ntv__chat-message--' + settingSpacing)

		if (channelData.me.isBroadcaster || channelData.me.isModerator || channelData.me.isSuperAdmin) {
			const settingModeratorQuickAction = settingsManager.getSetting(
				channelId,
				'moderators.chat.show_quick_actions'
			)

			if (settingModeratorQuickAction) {
				messageEl.classList.add('ntv__chat-message--show-quick-actions')
			}
		}

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
			<div class="ntv__chat-message">
				<div class="group relative">
					<--|| Content remains the same ||-->
				</div>
				<div class="ntv__chat-message__inner">
					<div class="ntv__chat-message">
						<span class="ntv__chat-message__identity">...</span>
						<span class="ntv__chat-message__part">Foobar</span>
						<span class="ntv__chat-message__part ntv__inline-emote-box">
							<img>
						</span>
					</div>
				</div>
			</div>
		*/

		const isOldWebsiteLayout = channelData.isModView || channelData.isCreatorView
		if (!isOldWebsiteLayout) {
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

			const ntvMessageInnerEl = document.createElement('div')

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

			const messageHasMentionedMe = betterHoverEl.classList.contains('border-green-500')
			if (messageHasMentionedMe) {
				messageNode.classList.add('ntv__chat-message--mentioned-me')
			}

			let isReply = false
			let isReplyToMe = false
			if (betterHoverEl.firstElementChild?.classList.contains('w-full')) {
				isReply = true

				if (betterHoverEl.classList.contains('border-green-500')) {
					isReplyToMe = true
					messageNode.classList.add('ntv__chat-message--reply-to-me')
				}

				// Clone the reply message attachment to our chat message container
				const replyMessageAttachmentEl = betterHoverEl.firstElementChild
				if (!replyMessageAttachmentEl) {
					messageNode.classList.remove('ntv__chat-message--unrendered')
					error('Reply message attachment element not found', messageNode)
					return
				}

				const ntvMessageAttachmentEl = replyMessageAttachmentEl.cloneNode(true) as HTMLElement
				ntvMessageAttachmentEl.className = 'ntv__chat-message__attachment'
				ntvMessageInnerEl.append(ntvMessageAttachmentEl)
				;(replyMessageAttachmentEl as HTMLElement).style.setProperty('display', 'none', 'important')

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

			let ntvModBtnsWrapperEl: HTMLElement | null = null
			if (channelData.me.isBroadcaster || channelData.me.isModerator || channelData.me.isSuperAdmin) {
				// mod quick buttons can be in different places depending on if message is a reply or not
				const modBtnsWrapperEl = messageBodyWrapper.firstElementChild

				if (modBtnsWrapperEl?.classList.contains('inline-flex')) {
					ntvModBtnsWrapperEl = document.createElement('div')
					ntvModBtnsWrapperEl.className = 'ntv__chat-message__mod-buttons'

					const modDeleteBtnEl = modBtnsWrapperEl.children[0]
					const modTimeoutBtnEl = modBtnsWrapperEl.children[1]
					const modBanBtnEl = modBtnsWrapperEl.children[2]
					const ntvModDeleteBtnEl = modDeleteBtnEl.cloneNode(true) as HTMLElement
					const ntvModTimeoutBtnEl = modTimeoutBtnEl.cloneNode(true) as HTMLElement
					const ntvModBanBtnEl = modBanBtnEl.cloneNode(true) as HTMLElement

					ntvModBtnsWrapperEl.append(ntvModDeleteBtnEl, ntvModTimeoutBtnEl, ntvModBanBtnEl)

					ntvModDeleteBtnEl.addEventListener('click', () => {
						const mEvent = new MouseEvent('click', { bubbles: true, cancelable: true })
						Object.defineProperty(mEvent, 'target', { value: modDeleteBtnEl, enumerable: true })
						modDeleteBtnEl.dispatchEvent(mEvent)
					})
					ntvModTimeoutBtnEl.addEventListener('click', () => {
						const mEvent = new MouseEvent('click', { bubbles: true, cancelable: true })
						Object.defineProperty(mEvent, 'target', { value: modTimeoutBtnEl, enumerable: true })
						modTimeoutBtnEl.dispatchEvent(mEvent)
					})
					ntvModBanBtnEl.addEventListener('click', () => {
						const mEvent = new MouseEvent('click', { bubbles: true, cancelable: true })
						Object.defineProperty(mEvent, 'target', { value: modBanBtnEl, enumerable: true })
						modBanBtnEl.dispatchEvent(mEvent)
					})
				}
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
			while (usernameEl && usernameEl.tagName !== 'BUTTON')
				usernameEl = usernameEl.nextElementSibling as HTMLElement
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
			ntvSeparatorEl.textContent = ':'

			// Add NTV badge to badges container
			if (settingsManager.getSetting(channelId, 'chat.badges.show_ntv_badge')) {
				// Check if message has been signed by NTV
				const lastChildNode = contentWrapperNode.lastChild
				if (lastChildNode?.textContent?.endsWith(U_TAG_NTV_AFFIX)) {
					const badgeEl = parseHTML(
						this.session.badgeProvider.getBadge({ type: 'nipahtv' } as Badge) as string,
						true
					) as HTMLElement

					ntvBadgesEl.append(badgeEl)
				}
			}

			if (ntvModBtnsWrapperEl) ntvIdentityWrapperEl.append(ntvModBtnsWrapperEl)
			ntvIdentityWrapperEl.append(ntvTimestampEl, ntvBadgesEl, ntvUsernameEl, ntvSeparatorEl)

			const messageParts = []
			for (const contentNode of contentWrapperNode.childNodes) {
				if (contentNode.nodeType === Node.TEXT_NODE) {
					emotesManager.parseEmoteText(contentNode.textContent || '', messageParts)
				} else if (contentNode instanceof HTMLElement && contentNode!.tagName === 'SPAN') {
					// Unwrap and clean up native Kick emotes
					const imgEl = contentNode.firstElementChild?.firstElementChild
					if (!imgEl || imgEl instanceof HTMLImageElement === false) {
						error('Emote image element not found', imgEl)
						continue
					}

					const emoteId = contentNode.getAttribute('data-emote-id')
					const emoteName = contentNode.getAttribute('data-emote-name')
					if (!emoteId || !emoteName) {
						error('Emote ID or name not found', contentNode)
						continue
					}

					// Will not return anything for subscriber emotes that are not loaded
					let emote = emotesManager.getEmoteByName(emoteName)

					if (!emote) {
						emote = {
							id: emoteId,
							name: emoteName,
							isSubscribersOnly: true,
							provider: PROVIDER_ENUM.KICK
						} as Emote
					}

					messageParts.push({
						type: 'emote' as const,
						emote
					})
				} else {
					messageParts.push(contentNode.cloneNode(true))
				}
			}

			;(groupElementNode as HTMLElement).style.display = 'none'

			// const ntvMessagePartsWrapperEl = document.createElement('div')
			// ntvMessagePartsWrapperEl.className = 'ntv__chat-message__parts-wrapper'
			// ntvMessagePartsWrapperEl.append(...messagePartNodes)

			ntvMessageInnerEl.className = 'ntv__chat-message__inner'
			ntvMessageInnerEl.append(ntvIdentityWrapperEl)
			ntvMessageInnerEl.append(...this.renderMessageParts(messageParts))

			// Append all the nodes to our own chat message container
			// We do this late so checks can be done and bailout early
			//   if necessary leaving the original message untouched
			// messageNode.append(ntvChatMessageEl)
			messageNode.append(ntvMessageInnerEl)
			// messageNode.append(ntvIdentityWrapperEl)
			// messageNode.append(...messagePartNodes)
			// messageNode.append(ntvMessagePartsWrapperEl)

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
							this.handleMessageReplyBtnClick(messageNode, buttonEl as HTMLElement)
						} else {
							// TODO implement the rest of the buttons
							const event = new MouseEvent('click', { bubbles: true, cancelable: true })
							Object.defineProperty(event, 'target', { writable: false, value: buttonEl })
							buttonEl.dispatchEvent(event)
						}
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
		// Chatroom is old Kick design in mod or creator view
		else {
			if (messageNode.children && messageNode.children[0]?.classList.contains('chatroom-history-breaker')) {
				messageNode.classList.add('ntv__chat-message--history-breaker')
				messageNode.classList.remove('ntv__chat-message--unrendered')
				return
			}

			const chatEntryEl = messageNode.querySelector('.chat-entry')
			if (!chatEntryEl) {
				//? Sometimes Kick decides to just not load messages.
				messageNode.classList.remove('ntv__chat-message--unrendered')
				return error('Unable to render message, message has no content loaded..') // messageNode
			}
			if (chatEntryEl.classList.contains('border-primary')) {
				messageNode.classList.add('ntv__chat-message--mentioned-me')
			}

			// Test if message has a reply attached to it
			let messageBodyNode: HTMLElement
			let messageReplyAttachmentBodyNode: HTMLElement | null = null
			if (messageNode.querySelector('[title*="Replying to"]')) {
				messageReplyAttachmentBodyNode = chatEntryEl.children[0] as HTMLElement
				messageBodyNode = chatEntryEl.children[1] as HTMLElement
			} else {
				messageBodyNode = chatEntryEl.children[0] as HTMLElement
			}

			const chatMessageIdentityEl = messageNode.querySelector('.chat-message-identity')
			if (!chatMessageIdentityEl) {
				messageNode.classList.remove('ntv__chat-message--unrendered')
				error('Chat message identity node not found', messageNode)
				return
			}

			const chatMessageWrapper = chatMessageIdentityEl.parentElement
			const timestampEl = chatMessageWrapper?.firstElementChild
			const modActionsEl = timestampEl?.nextElementSibling
			const messageContentEl = chatMessageWrapper!.lastElementChild as HTMLElement

			let ntvModBtnsWrapperEl: HTMLElement | null = null
			if (channelData.me.isBroadcaster || channelData.me.isModerator || channelData.me.isSuperAdmin) {
				if (modActionsEl?.classList.contains('stroke-gray-600')) {
					ntvModBtnsWrapperEl = document.createElement('div')
					ntvModBtnsWrapperEl.className = 'ntv__chat-message__mod-buttons'

					const modDeleteBtnEl = modActionsEl.children[0]
					const modTimeoutBtnEl = modActionsEl.children[1]
					const modBanBtnEl = modActionsEl.children[2]

					ntvModBtnsWrapperEl.append(modDeleteBtnEl, modTimeoutBtnEl, modBanBtnEl)
				}
			}

			const badgesEl = chatMessageIdentityEl!.firstElementChild
			const usernameEl = badgesEl?.nextElementSibling as HTMLElement

			const ntvBadgesEl = document.createElement('span')
			ntvBadgesEl.className = 'ntv__chat-message__badges'

			for (const badgeWrapperEl of badgesEl?.children || []) {
				const subWrapperEl = badgeWrapperEl.firstElementChild as HTMLElement

				let imgOrSvgEl: Element | null = subWrapperEl
				if (imgOrSvgEl && imgOrSvgEl.tagName !== 'IMG' && imgOrSvgEl.tagName !== 'svg')
					imgOrSvgEl = imgOrSvgEl.firstElementChild
				if (imgOrSvgEl && imgOrSvgEl.tagName !== 'IMG' && imgOrSvgEl.tagName !== 'svg')
					imgOrSvgEl = imgOrSvgEl.firstElementChild
				if (!imgOrSvgEl || (imgOrSvgEl.tagName !== 'IMG' && imgOrSvgEl.tagName !== 'svg')) {
					error('Badge image or svg element not found', imgOrSvgEl, subWrapperEl)
					continue
				}

				const ntvBadgeEl = imgOrSvgEl?.cloneNode(true) as HTMLElement
				// ntvBadgeEl.setAttribute('class', 'ntv__badge')
				ntvBadgeEl.classList.add('ntv__badge')
				// subWrapperEl.setAttribute('class', 'ntv__chat-message__badge')
				ntvBadgesEl.append(ntvBadgeEl)
			}

			if (chatMessageIdentityEl) {
				// Add NTV badge to badges container
				if (settingsManager.getSetting(channelId, 'chat.badges.show_ntv_badge')) {
					// Check if message has been signed by NTV
					const lastElChild = messageBodyNode.lastElementChild
					if (lastElChild?.textContent?.endsWith(U_TAG_NTV_AFFIX)) {
						const badgesContainer = chatMessageIdentityEl.getElementsByClassName('items-center')[0]
						if (badgesContainer) {
							// Kick normally adds a margin-right tailwind class when container is no longer empty so we simulate it
							if (!badgesContainer.children.length) badgesContainer.classList.add('mr-1')

							const ntvBadgeEl = parseHTML(
								this.session.badgeProvider.getBadge({ type: 'nipahtv' } as Badge) as string,
								true
							) as HTMLElement

							// Setting .className prop is forbidden here because it has no setter
							ntvBadgeEl.setAttribute('class', 'ntv__badge')
							ntvBadgesEl.append(ntvBadgeEl)
						}
					}
				}
			}

			const messageParts: Array<
				string | Node | { type: 'emote'; emote: Emote } | { type: 'emoji'; url: string; alt: string }
			> = []
			const messageContentNodes = Array.from(messageContentEl.children)

			for (let i = 0; i < messageContentNodes.length; i++) {
				const contentNode = messageContentNodes[i]
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
						emotesManager.parseEmoteText(componentNode.textContent || '', messageParts)
						break

					case 'chat-emote-container':
						// Unwrap and clean up native Kick emotes
						const imgEl = componentNode.querySelector('img')
						if (!imgEl) continue

						const emoteId = imgEl.getAttribute('data-emote-id')
						const emoteName = imgEl.getAttribute('data-emote-name')
						if (!emoteId || !emoteName) {
							error('Emote ID or name not found', contentNode)
							continue
						}

						// Will not return anything for subscriber emotes that are not loaded
						let emote = emotesManager.getEmoteByName(emoteName)

						if (!emote) {
							emote = {
								id: emoteId,
								name: emoteName,
								isSubscribersOnly: true,
								provider: PROVIDER_ENUM.KICK
							} as Emote
						}

						messageParts.push({
							type: 'emote' as const,
							emote
						})
						break

					default:
						if (componentNode.childNodes.length) messageParts.push(...componentNode.childNodes)
						else error('Unknown chat message component', componentNode)
				}
			}

			const ntvMessageInnerEl = document.createElement('div')
			ntvMessageInnerEl.className = 'ntv__chat-message__inner'

			const ntvIdentityWrapperEl = document.createElement('div')
			ntvIdentityWrapperEl.classList.add('ntv__chat-message__identity')

			const ntvTimestampEl = document.createElement('span')
			ntvTimestampEl.className = 'ntv__chat-message__timestamp'
			ntvTimestampEl.textContent = timestampEl?.textContent || '00:00 AM'

			if (badgesEl && badgesEl.tagName === 'DIV') {
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

			const username = usernameEl.textContent || 'Unknown user'
			const ntvUsernameEl = document.createElement('span')
			ntvUsernameEl.className = 'ntv__chat-message__username'
			ntvUsernameEl.title = username || 'Unknown user'
			ntvUsernameEl.textContent = username || 'Unknown user'
			ntvUsernameEl.style.color = usernameEl!.style.color || 'inherit'

			ntvUsernameEl.addEventListener('click', evt => {
				const event = new MouseEvent('click', { bubbles: true, cancelable: false })
				Object.defineProperty(event, 'target', { value: usernameEl, enumerable: true })
				usernameEl.dispatchEvent(event)
			})

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

			const ntvSeparatorEl = document.createElement('span')
			ntvSeparatorEl.className = 'ntv__chat-message__separator'
			ntvSeparatorEl.textContent = ':'

			if (messageReplyAttachmentBodyNode) {
				const ntvMessageAttachmentEl = document.createElement('div')
				ntvMessageAttachmentEl.className = 'ntv__chat-message__attachment'
				ntvMessageInnerEl.append(messageReplyAttachmentBodyNode.cloneNode(true))
			}

			if (ntvModBtnsWrapperEl) ntvIdentityWrapperEl.append(ntvModBtnsWrapperEl)
			ntvIdentityWrapperEl.append(ntvTimestampEl, ntvBadgesEl, ntvUsernameEl, ntvSeparatorEl)
			ntvMessageInnerEl.append(ntvIdentityWrapperEl, ...this.renderMessageParts(messageParts))

			// Observe changes to detect when message is deleted
			this.deletedChatEntryObserver?.observe(messageBodyNode, {
				childList: true,
				attributes: false,
				subtree: false
			})

			messageNode.classList.add('ntv__chat-message', 'kick__chat-message--old-format')
			messageNode.classList.remove('ntv__chat-message--unrendered')
			// messageNode.append(ntvMessageInnerEl)
			chatEntryEl.prepend(ntvMessageInnerEl)
		}
	}

	async loadNativeKickFallbackReplyBehaviour(fallbackButtonEl: HTMLElement) {
		const channelData = this.session.channelData

		const event = new MouseEvent('click', { bubbles: true, cancelable: true })
		Object.defineProperty(event, 'target', { writable: false, value: fallbackButtonEl })
		fallbackButtonEl.dispatchEvent(event)

		if (!channelData.isModView && !channelData.isCreatorView) {
			// Because there's no message IDs in DOM it's impossible to handle reply message behaviour properly
			//  so we have to do this ugly temporary solution where we restore the original Kick text field.
			// This is only temporary until we have fully implemented our own chat message system.
			const textFieldEl = this.elm.textField!
			const kickTextFieldEl = document.querySelector('.editor-input[contenteditable="true"]')

			textFieldEl.parentElement!.style.display = 'none'
			kickTextFieldEl?.parentElement?.style.setProperty('display', 'block', 'important')

			const kickEmoteButtonEl = kickTextFieldEl?.parentElement?.nextElementSibling as HTMLElement
			if (kickEmoteButtonEl) kickEmoteButtonEl.style.setProperty('display', 'flex', 'important')

			this.elm.submitButton!.style.setProperty('display', 'none', 'important')
			this.elm.originalSubmitButton!.style.setProperty('display', 'flex', 'important')
			;(document.querySelector('.ntv__emote-menu-button') as HTMLElement)?.style.setProperty(
				'display',
				'none',
				'important'
			)
			;(document.querySelector('.ntv__quick-emotes-holder') as HTMLElement)?.style.setProperty(
				'display',
				'none',
				'important'
			)

			await waitForElements(['.kick__chat-footer path[d*="M28 6.99204L25.008 4L16"]'], 2000)

			const closeReplyButton = document
				.querySelector('.kick__chat-footer path[d*="M28 6.99204L25.008 4L16"]')
				?.closest('button')!

			const replyPreviewWrapperEl = closeReplyButton.closest('.flex.flex-col')?.parentElement
			if (!replyPreviewWrapperEl) return error('Reply preview wrapper element not found')

			const restoreFields = () => {
				kickTextFieldEl!.parentElement!.style.removeProperty('display')
				textFieldEl.parentElement!.style.removeProperty('display')
				this.elm.submitButton!.style.removeProperty('display')
				this.elm.originalSubmitButton!.style.removeProperty('display')
				;(document.querySelector('.ntv__quick-emotes-holder') as HTMLElement)?.style.removeProperty('display')
				;(document.querySelector('.ntv__emote-menu-button') as HTMLElement)?.style.removeProperty('display')

				const kickEmoteButtonEl = kickTextFieldEl?.parentElement?.nextElementSibling as HTMLElement
				if (kickEmoteButtonEl) kickEmoteButtonEl.style.removeProperty('display')
			}

			if (!isElementInDOM(replyPreviewWrapperEl)) restoreFields()
			else {
				// Attach observer to reply message button to detect when the element is removed
				//  so we know the reply message has been closed and we can restore the text field.
				const observer = new MutationObserver(mutations => {
					mutations.forEach(mutation => {
						if (mutation.removedNodes.length) {
							restoreFields()
							observer.disconnect()
						}
					})
				})
				observer.observe(replyPreviewWrapperEl, { childList: true })
			}

			// Theres some weird bug where the observer doesnt trigger when the reply message is closed
			//  so we have to add a setInterval to check if the reply message is still in the DOM.
			const footerEl = document.querySelector('.kick__chat-footer')
			if (!footerEl) return error('Footer element not found')

			const textFieldParent = textFieldEl.parentElement!
			const intervalId = setInterval(() => {
				const closeReplyBtnEl = footerEl.querySelector('path[d*="M28 6.99204L25.008 4L16"]')
				if (!closeReplyBtnEl) {
					if (textFieldParent.style.display === 'none') restoreFields()
					clearInterval(intervalId)
				}
			}, 400)
		}
		// Chatroom is old Kick design in mod or creator view
		else {
		}
	}

	handleMessageReplyBtnClick(messageNode: HTMLElement, fallbackButtonEl: HTMLElement) {
		const { inputController } = this
		const { channelData } = this.session
		if (!channelData.me.isLoggedIn) return

		if (channelData.isCreatorView || channelData.isModView)
			return this.loadNativeKickFallbackReplyBehaviour(fallbackButtonEl)

		const reactivePropsKey = Object.keys(messageNode).find(key => key.startsWith('__reactProps$'))
		if (!reactivePropsKey) return this.loadNativeKickFallbackReplyBehaviour(fallbackButtonEl)

		// @ts-expect-error
		const reactiveProps = messageNode[reactivePropsKey]

		const messageProps = reactiveProps.children?.props
		if (!messageProps) return this.loadNativeKickFallbackReplyBehaviour(fallbackButtonEl)

		const chatEntry = messageProps.chatEntry
		if (!chatEntry) return this.loadNativeKickFallbackReplyBehaviour(fallbackButtonEl)

		const { chat_id, content: messageContent, created_at, id: messageId, user_id, sender } = chatEntry.data
		if (!sender) return this.loadNativeKickFallbackReplyBehaviour(fallbackButtonEl)

		const { id: senderId, slug: senderSlug, username: senderUsername } = sender
		if (!senderId || !senderUsername) return this.loadNativeKickFallbackReplyBehaviour(fallbackButtonEl)

		if (!inputController) return error('Input controller not loaded for reply behaviour')

		// Handle the reply message UI
		const replyMessageWrapperEl = document.createElement('div')
		replyMessageWrapperEl.classList.add('ntv__reply-message__wrapper')
		document.querySelector('#chat-input-wrapper')?.parentElement?.prepend(replyMessageWrapperEl)
		this.elm.replyMessageWrapper = replyMessageWrapperEl

		const msgInnerEl = messageNode.querySelector('.ntv__chat-message__inner')
		if (!msgInnerEl) {
			error('Message inner element not found', messageNode)
			return this.loadNativeKickFallbackReplyBehaviour(fallbackButtonEl)
		}

		// Uses username, not slug!
		this.replyMessage(Array.from(msgInnerEl.children), messageId, messageContent, senderId, senderUsername)

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

	applyModViewFixes() {
		const chatroomEl = document.getElementById('chatroom')
		if (chatroomEl) {
			const chatroomParentEl = chatroomEl.parentElement! as HTMLElement
			chatroomParentEl.style.setProperty('overflow-x', 'hidden')
		}
	}

	renderPinnedMessageContent(contentBodyEl: HTMLElement) {
		log('Rendering pinned message..')

		const ntvPinnedMessageBodyEl = document.createElement('div')
		ntvPinnedMessageBodyEl.className = 'ntv__pinned-message__content'
		const emotesManager = this.session.emotesManager

		const parsedEmoteParts: Array<
			string | Node | { type: 'emote'; emote: Emote } | { type: 'emoji'; url: string; alt: string }
		> = []
		for (const childNode of Array.from(contentBodyEl.childNodes)) {
			if (childNode.nodeType === Node.TEXT_NODE) {
				emotesManager.parseEmoteText(childNode.textContent || '', parsedEmoteParts)
			} else if (childNode.nodeType === Node.ELEMENT_NODE) {
				const emoteName = (childNode as HTMLElement).getAttribute('data-emote-name')
				const emoteId = (childNode as HTMLElement).getAttribute('data-emote-id')

				if (!emoteId || !emoteName) {
					error('Emote ID or name not found', childNode)
					parsedEmoteParts.push(childNode.cloneNode(true))
					continue
				}

				let emote = emotesManager.getEmoteByName(emoteName)
				if (!emote) {
					emote = {
						id: emoteId,
						name: emoteName,
						isSubscribersOnly: true,
						provider: PROVIDER_ENUM.KICK
					} as Emote
				}

				parsedEmoteParts.push({
					type: 'emote',
					emote
				})
			} else {
				error('Unknown node found for pinned message', childNode)
				parsedEmoteParts.push(childNode.cloneNode(true))
			}
		}

		ntvPinnedMessageBodyEl.append(...this.renderMessageParts(parsedEmoteParts))
		contentBodyEl.before(ntvPinnedMessageBodyEl)
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
		if (this.deletedChatEntryObserver) this.deletedChatEntryObserver.disconnect()
		if (this.replyObserver) this.replyObserver.disconnect()
		if (this.pinnedMessageObserver) this.pinnedMessageObserver.disconnect()
		if (this.inputController) this.inputController.destroy()
		if (this.emoteMenu) this.emoteMenu.destroy()
		if (this.emoteMenuButton) this.emoteMenuButton.destroy()
		if (this.quickEmotesHolder) this.quickEmotesHolder.destroy()
		if (this.clearQueuedChatMessagesInterval) clearInterval(this.clearQueuedChatMessagesInterval)
		if (this.reloadUIhackInterval) clearInterval(this.reloadUIhackInterval)

		this.domEventManager.removeAllEventListeners()

		// Remove inserted elements
		Array.from(document.querySelectorAll('.ntv__chat-message, .ntv__chat-message--unrendered')).forEach(node => {
			const el = node as HTMLElement
			el.querySelectorAll('.ntv__chat-message__inner').forEach(innerNode => innerNode.remove())

			// Remove all classes starting with ntv__ from the element
			Array.from(el.classList).forEach(className => {
				if (className.startsWith('ntv__')) el.classList.remove(className)
			})
		})
		;['ntv__pinned-message__content'].forEach(className => {
			Array.from(document.querySelectorAll(`.${className}`)).forEach(node => node.remove())
		})

		// Remove classes from everything
		;['ntv__emote-menu-button', 'ntv__submit-button disabled', 'ntv__quick-emotes-holder'].forEach(className => {
			Array.from(document.querySelectorAll(`.${className}`)).forEach(node => node.classList.remove(className))
		})
	}
}
