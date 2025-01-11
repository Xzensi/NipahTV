import {
	assertArgDefined,
	waitForElements,
	hex2rgb,
	parseHTML,
	findNodeWithTextContent,
	waitForTargetedElements,
	isElementInDOM,
	cleanupHTML
} from '@core/Common/utils'
import QuickEmotesHolderComponent from '@core/Chat/Components/QuickEmotesHolderComponent'
import EmoteMenuButtonComponent from '@core/Chat/Components/EmoteMenuButtonComponent'
import EmoteMenuComponent from '@core/Chat/Components/EmoteMenuComponent'
import AbstractUserInterface from '@core/UI/AbstractUserInterface'
import { PROVIDER_ENUM, U_TAG_NTV_AFFIX } from '@core/Common/constants'
import type UserInfoModal from '@core/Users/UserInfoModal'
import DOMEventManager from '@core/Common/DOMEventManager'
import InputController from '@core/Input/InputController'
import type { Badge } from '@core/Emotes/BadgeProvider'
import { Logger } from '@core/Common/Logger'
import { Caret } from '@core/UI/Caret'

const logger = new Logger()
const { log, info, error } = logger.destruct()

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
		info('KICK', 'UI', 'Creating user interface..')

		super.loadInterface()

		const { abortController } = this
		const { settingsManager, eventBus: rootEventBus } = this.rootContext
		const { channelData, eventBus } = this.session
		const { channelId } = channelData
		const abortSignal = abortController.signal

		this.loadAnnouncements()
		this.loadSettings()
		this.loadStylingVariables()
		this.loadDocumentPatches()

		if (channelData.isModView || channelData.isCreatorView) {
			// Wait for text input & submit button to load
			waitForElements(['#message-input', '#chatroom-footer .send-row > button'], 15_000, abortSignal)
				.then(foundElements => {
					if (this.session.isDestroyed) return

					const [textFieldEl, submitButtonEl] = foundElements as HTMLElement[]
					this.loadInputBehaviour(textFieldEl, submitButtonEl)
					this.loadEmoteMenu()
				})
				.catch(() => {})

			// Wait for chat footer to load
			waitForElements(['#chatroom-footer'], 15_000, abortSignal)
				.then(foundElements => {
					if (this.session.isDestroyed) return

					const [footerEl] = foundElements as HTMLElement[]
					footerEl.classList.add('kick__chat-footer')

					// Initialize a container for the timers UI
					const timersContainer = document.createElement('div')
					timersContainer.id = 'ntv__timers-container'
					footerEl.append(timersContainer)
					this.elm.timersContainer = timersContainer

					waitForElements(['#quick-emotes-holder'], 10_000, abortSignal)
						.then(foundElements => {
							const [quickEmotesHolderEl] = foundElements as HTMLElement[]
							this.loadQuickEmotesHolder(footerEl, quickEmotesHolderEl)
						})
						.catch(() => {})

					waitForElements(['#chatroom-footer .send-row'], 15_000, abortSignal)
						.then(foundElements => {
							if (this.session.isDestroyed) return

							const [footerBottomBarEl] = foundElements as HTMLElement[]
							this.loadEmoteMenuButton(footerBottomBarEl)
						})
						.catch(() => {})
				})
				.catch(() => {})

			// Wait for chat messages container to load
			waitForElements(['#chatroom-top + div.overflow-hidden > .overflow-x-hidden'], 15_000, abortSignal)
				.then(foundElements => {
					if (this.session.isDestroyed) return

					const [chatMessagesContainerEl] = foundElements as HTMLElement[]
					this.elm.chatMessagesContainer = chatMessagesContainerEl

					this.applyChatContainerClasses()

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
				15_000,
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
			waitForElements([`${footerSelector}`], 15_000, abortSignal)
				.then(foundElements => {
					if (this.session.isDestroyed) return

					const [footerEl] = foundElements as HTMLElement[]
					footerEl.classList.add('kick__chat-footer')

					// Initialize a container for the timers UI
					const timersContainer = document.createElement('div')
					timersContainer.id = 'ntv__timers-container'
					footerEl.append(timersContainer)
					this.elm.timersContainer = timersContainer

					waitForElements(['#quick-emotes-holder'], 10_000, abortSignal)
						.then(foundElements => {
							const [quickEmotesHolderEl] = foundElements as HTMLElement[]
							this.loadQuickEmotesHolder(footerEl, quickEmotesHolderEl)
						})
						.catch(() => {})

					waitForElements(
						[`${footerSelector} > div.flex > .flex.items-center > .items-center`],
						15_000,
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
			waitForElements([chatMessagesContainerSelector], 15_000, abortSignal)
				.then(foundElements => {
					if (this.session.isDestroyed) return

					const [chatMessagesContainerEl] = foundElements as HTMLElement[]
					this.elm.chatMessagesContainer = chatMessagesContainerEl

					this.applyChatContainerClasses()

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
			waitForElements(['#video-player', chatMessagesContainerSelector], 15000, abortSignal)
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

				if (sendImmediately && !this.isReplyingToMessage()) {
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
			'ntv.settings.change.chat.messages.show_timestamps',
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
			'ntv.settings.change.chat.messages.alternating_background',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				//* Not respecting chatroomContainerSelector on purpose here because vods reverse the order of chat messages resulting in alternating background not working as expected
				document
					.querySelector('.ntv__chat-messages-container')
					?.classList.toggle('ntv__alternating-background', !!value)
			}
		)

		// Add seperator lines to chat messages
		rootEventBus.subscribe(
			'ntv.settings.change.chat.messages.seperators',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				Array.from(document.getElementsByClassName('ntv__chat-message')).forEach((el: Element) => {
					if (prevValue !== 'none') el.classList.remove(`ntv__chat-message--seperator-${prevValue}`)
					if (value !== 'none') el.classList.add(`ntv__chat-message--seperator-${value}`)
				})
			}
		)

		// Chat messages spacing settings change
		rootEventBus.subscribe(
			'ntv.settings.change.chat.messages.spacing',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				Array.from(document.getElementsByClassName('ntv__chat-message')).forEach((el: Element) => {
					if (value === 'none' && prevValue !== 'none') el.classList.remove(`ntv__chat-message--${prevValue}`)
					if (value !== 'none' && prevValue === 'none') el.classList.add(`ntv__chat-message--${value}`)
				})
			}
		)

		// Chat messages style settings change
		rootEventBus.subscribe(
			'ntv.settings.change.chat.messages.style',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				Array.from(document.getElementsByClassName('ntv__chat-message')).forEach((el: Element) => {
					if (prevValue !== 'none') el.classList.remove(`ntv__chat-message--theme-${prevValue}`)
					if (value !== 'none') el.classList.add(`ntv__chat-message--theme-${value}`)
				})
			}
		)

		// On sigterm signal, cleanup user interface
		eventBus.subscribe('ntv.session.destroy', this.destroy.bind(this))
		eventBus.subscribe('ntv.session.ui.restore_original', this.restoreOriginalUi.bind(this))
	}

	applyChatContainerClasses() {
		const settingsManager = this.rootContext.settingsManager
		const channelId = this.session.channelData.channelId

		const chatMessagesContainerEl = this.elm.chatMessagesContainer
		if (!chatMessagesContainerEl) return error('KICK', 'UI', 'Chat messages container not loaded for settings')

		chatMessagesContainerEl.classList.add('ntv__chat-messages-container')

		// Show timestamps for messages
		if (settingsManager.getSetting(channelId, 'chat.messages.show_timestamps')) {
			chatMessagesContainerEl.classList.add('ntv__show-message-timestamps')
		}

		// Add alternating background color to chat messages
		if (settingsManager.getSetting(channelId, 'chat.messages.alternating_background')) {
			chatMessagesContainerEl.classList.add('ntv__alternating-background')
		}

		if (settingsManager.getSetting(channelId, 'chat.behavior.smooth_scrolling')) {
			chatMessagesContainerEl.classList.add('ntv__smooth-scrolling')
		}
	}

	// TODO move methods like this to super class. this.elm.textfield event can be in contentEditableEditor
	async loadEmoteMenu() {
		if (!this.session.channelData.me.isLoggedIn) return
		if (!this.elm.textField) return error('KICK', 'UI', 'Text field not loaded for emote menu')

		const container = this.elm.textField.parentElement!.parentElement!.parentElement!
		this.emoteMenu = new EmoteMenuComponent(this.rootContext, this.session, container).init()

		this.elm.textField.addEventListener('click', this.emoteMenu.toggleShow.bind(this.emoteMenu, false))
	}

	async loadEmoteMenuButton(kickFooterBottomBarEl: HTMLElement) {
		const placeholder = document.createElement('div')
		// const footerBottomBarEl = kickFooterBottomBarEl.lastElementChild?.lastElementChild
		// if (!footerBottomBarEl) return error('KICK', 'UI', 'Footer bottom bar not found for emote menu button')

		const footerSubmitButtonWrapper = kickFooterBottomBarEl
		if (!footerSubmitButtonWrapper)
			return error('KICK', 'UI', 'Footer submit button wrapper not found for emote menu button')

		footerSubmitButtonWrapper.prepend(placeholder)
		this.emoteMenuButton = new EmoteMenuButtonComponent(this.rootContext, this.session, placeholder).init()

		// Temporary hack to detect when our elements got removed
		//  so we can reload the session to reinitialize the UI.
		this.reloadUIhackInterval = setInterval(() => {
			if (!this.emoteMenuButton!.element.isConnected) {
				info('KICK', 'UI', 'Emote menu button got removed. Reloading session to reinitialize UI.')
				this.destroy()
				this.session.eventBus.publish('ntv.session.reload')
			}
		}, 700)
	}

	async loadQuickEmotesHolder(kickFooterEl: HTMLElement, kickQuickEmotesHolderEl?: HTMLElement) {
		const { settingsManager, eventBus: rootEventBus } = this.rootContext
		const { channelData } = this.session
		const { channelId } = channelData
		const quickEmotesHolderEnabled = settingsManager.getSetting(channelId, 'quick_emote_holder.enabled')

		if (quickEmotesHolderEnabled) {
			const quickEmotesHolderPlaceholder = document.createElement('div')
			kickFooterEl.prepend(quickEmotesHolderPlaceholder)
			kickQuickEmotesHolderEl?.style.setProperty('display', 'none', 'important')

			const celebrationsPlaceholder = document.createElement('div')
			quickEmotesHolderPlaceholder.after(celebrationsPlaceholder)
			// this.loadCelebrationsBehaviour(celebrationsPlaceholder)

			this.quickEmotesHolder = new QuickEmotesHolderComponent(
				this.rootContext,
				this.session,
				quickEmotesHolderPlaceholder
			).init()
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
			 * - old_popout_chatroom
			 * -
			 */
			// Current page is the old popout chatroom page, advise users not to use this URL hack
			if (window.location.pathname.split('/')[2] === 'chatroom') {
				const newURL = `popout/${window.location.pathname.split('/')[1]}/chat`
				announcementService.registerAnnouncement({
					id: 'old_popout_chatroom',
					message: `
						<h2>⚠️ <strong>Outdated Chatroom Warning</strong> ⚠️</h2>
						<p>Uh-oh.. Looks like you found the old popout chatroom page from before the Kick 2.0 website update.</p>
						<p>This page uses the old Kick layout and is no longer compatible with NTV. You can find the new popout chatroom page here: <a href='//kick.com/${newURL}'>kick.com/${newURL}</a></p>
					`
				})
				if (announcementService.hasAnnouncement('old_popout_chatroom')) {
					setTimeout(() => {
						announcementService.displayAnnouncement('old_popout_chatroom')
					}, 1000)
				}
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

		const firstMessageHighlightColor = settingsManager.getSetting(channelId, 'chat.messages.highlight_color')
		if (firstMessageHighlightColor) {
			const rgb = hex2rgb(firstMessageHighlightColor)
			document.documentElement.style.setProperty(
				'--ntv-background-highlight-accent-1',
				`rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.8)`
			)
		}

		eventBus.subscribe(
			'ntv.settings.change.chat.messages.highlight_color',
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

	loadStylingVariables() {
		const { settingsManager, eventBus: rootEventBus } = this.rootContext
		const { channelData } = this.session
		const channelId = channelData.channelId

		// Chat message font size
		const messageFontSize = settingsManager.getSetting(channelId, 'chat.messages.font_size') || '13px'
		document.documentElement.style.setProperty('--ntv-chat-message-font-size', messageFontSize)

		rootEventBus.subscribe('ntv.settings.change.chat.messages.font_size', ({ value }: { value?: string }) => {
			if (!value) return
			document.documentElement.style.setProperty('--ntv-chat-message-font-size', value)
		})

		// Chat message spacing
		const messageSpacing = settingsManager.getSetting(channelId, 'chat.messages.spacing') || '0'
		document.documentElement.style.setProperty('--ntv-chat-message-spacing', messageSpacing)

		rootEventBus.subscribe('ntv.settings.change.chat.messages.spacing', ({ value }: { value?: string }) => {
			if (!value) return
			document.documentElement.style.setProperty('--ntv-chat-message-spacing', value)
		})

		// Emote size
		const emoteSize = settingsManager.getSetting(channelId, 'chat.messages.emotes.size') || '0'
		document.documentElement.style.setProperty('--ntv-chat-message-emote-size', emoteSize)

		rootEventBus.subscribe('ntv.settings.change.chat.messages.emotes.size', ({ value }: { value?: string }) => {
			if (!value) return
			document.documentElement.style.setProperty('--ntv-chat-message-emote-size', value)
		})

		// Emote overlap
		const emoteOverlap = settingsManager.getSetting(channelId, 'chat.messages.emotes.overlap') || '0'
		document.documentElement.style.setProperty('--ntv-chat-message-emote-overlap', emoteOverlap)

		rootEventBus.subscribe('ntv.settings.change.chat.messages.emotes.overlap', ({ value }: { value?: string }) => {
			if (!value) return
			document.documentElement.style.setProperty('--ntv-chat-message-emote-overlap', value)
		})
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
		if (!chatMessagesContainerEl)
			return error('KICK', 'UI', 'Chat messages container not loaded for scrolling behaviour')

		// Scroll is sticky by default
		if (this.stickyScroll) chatMessagesContainerEl.parentElement?.classList.add('ntv__sticky-scroll')

		// Enable sticky scroll when user scrolls to bottom
		this.domEventManager.addEventListener(
			chatMessagesContainerEl,
			'scroll',
			evt => {
				// log('KICK', 'UI', 'Scroll event', evt)
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
				// log('KICK', 'UI', 'Wheel event', evt)
				if (this.stickyScroll && evt.deltaY < 0) {
					chatMessagesContainerEl.parentElement?.classList.remove('ntv__sticky-scroll')
					this.stickyScroll = false
				}
			},
			{ passive: true }
		)
	}

	loadDocumentPatches() {
		const { settingsManager, eventBus: rootEventBus } = this.rootContext
		const channelId = this.session.channelData.channelId

		waitForElements(['body > div[data-theatre]'], 10_000)
			.then(([containerEl]) => {
				const chatPositionModeSetting = settingsManager.getSetting(channelId, 'chat.position')
				if (chatPositionModeSetting && chatPositionModeSetting !== 'none') {
					containerEl.classList.add('ntv__chat-position--' + chatPositionModeSetting)
				}
			})
			.catch(() => {})

		rootEventBus.subscribe(
			'ntv.settings.change.chat.position',
			({ value, prevValue }: { value: string; prevValue?: string }) => {
				const containerEl = document.querySelector('body > div[data-theatre]')
				if (!containerEl) return error('KICK', 'UI', 'Theatre container not found')

				if (prevValue && prevValue !== 'none') containerEl.classList.remove('ntv__chat-position--' + prevValue)
				if (value && value !== 'none') containerEl.classList.add('ntv__chat-position--' + value)
			}
		)
	}

	loadTheatreModeBehaviour() {
		if (this.session.isDestroyed) return

		const { settingsManager, eventBus: rootEventBus } = this.rootContext
		const channelId = this.session.channelData.channelId

		waitForElements(['body > div[data-theatre]'], 10_000)
			.then(([containerEl]) => {
				const chatPositionModeSetting = settingsManager.getSetting(channelId, 'chat.position')
				if (chatPositionModeSetting && chatPositionModeSetting !== 'none') {
					containerEl.classList.add('ntv__chat-position--' + chatPositionModeSetting)
				}

				const chatOverlayModeSetting = settingsManager.getSetting(channelId, 'appearance.layout.overlay_chat')
				if (chatOverlayModeSetting && chatOverlayModeSetting !== 'none') {
					containerEl.classList.add('ntv__theatre-overlay__mode')
					containerEl.classList.add(
						'ntv__theatre-overlay__mode--' + chatOverlayModeSetting.replaceAll('_', '-')
					)
				}

				const chatOverlayPositionSetting = settingsManager.getSetting(
					channelId,
					'appearance.layout.overlay_chat.position'
				)
				if (chatOverlayPositionSetting) {
					containerEl.classList.add(
						'ntv__theatre-overlay__position--' + chatOverlayPositionSetting.replaceAll('_', '-')
					)
				}

				const videoAlignmentModeSetting = settingsManager.getSetting(
					channelId,
					'appearance.layout.overlay_chat.video_alignment'
				)
				if (videoAlignmentModeSetting && videoAlignmentModeSetting !== 'none') {
					containerEl.classList.add(
						'ntv__theatre-overlay__video-alignment--' + videoAlignmentModeSetting.replaceAll('_', '-')
					)
				}
			})
			.catch(() => {})

		rootEventBus.subscribe(
			'ntv.settings.change.appearance.layout.overlay_chat',
			({ value, prevValue }: { value: string; prevValue?: string }) => {
				const containerEl = document.querySelector('body > div[data-theatre]')
				if (!containerEl) return error('KICK', 'UI', 'Theatre mode container not found')

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

		rootEventBus.subscribe(
			'ntv.settings.change.appearance.layout.overlay_chat.video_alignment',
			({ value, prevValue }: { value: string; prevValue?: string }) => {
				const containerEl = document.querySelector('body > div[data-theatre]')
				if (!containerEl) return error('KICK', 'UI', 'Theatre container not found')

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

		rootEventBus.subscribe(
			'ntv.settings.change.appearance.layout.overlay_chat.position',
			({ value, prevValue }: { value: string; prevValue?: string }) => {
				const containerEl = document.querySelector('body > div[data-theatre]')
				if (!containerEl) return error('KICK', 'UI', 'Theatre container not found')

				if (prevValue && prevValue !== 'none') {
					containerEl.classList.remove('ntv__theatre-overlay__position--' + prevValue.replaceAll('_', '-'))
				}

				if (value && value !== 'none') {
					containerEl.classList.add('ntv__theatre-overlay__position--' + value.replaceAll('_', '-'))
				}
			}
		)
	}

	loadCelebrationsBehaviour(placeholderEl: HTMLElement) {
		const { settingsManager, eventBus: rootEventBus } = this.rootContext
		const { channelData } = this.session

		const inputController = this.inputController
		if (!inputController) return error('KICK', 'UI', 'Input controller not loaded for celebrations behaviour')

		channelData.me.celebrations = [
			{
				createdAt: '2024-01-08T21:29:07.268773Z',
				deferred: false,
				id: 'chceleb_AAAAAAAAAAAAAAAAAAAAAAA',
				type: 'subscription_renewed',
				metadata: {
					streakMonths: 96,
					totalMonths: 96
				}
			}
		]

		const celebrations = channelData.me.celebrations
		log('KICK', 'UI', '@@@@@@@@@@ Loading celebrations..', celebrations)
		if (!celebrations) return

		const celebrationsContainerEl = document.createElement('div')
		celebrationsContainerEl.classList.add('ntv__celebrations')

		for (const celebration of celebrations) {
			if (celebration.type === 'subscription_renewed') {
				const months = celebration.metadata.totalMonths

				// Blatantly copy pasted because imminent NTV V2.0 reworks it anyway. Got to love how Tailwind classes make it unreadable garbage.
				// TODO NOTE: The celebration banner cards should change color based on months subbed.
				const celebrationEl = parseHTML(
					cleanupHTML(`
					<div class="ntv__celebration ntv__celebration--subscription-renewed relative flex min-h-[60px] flex-row flex-nowrap items-center justify-between gap-2 rounded p-2 text-black [&>svg]:fill-black mb-2" style="background-color: #ff9d00">
						<div class="flex h-full flex-row flex-nowrap items-center gap-2 empty:hidden shrink grow">
							<svg width="32" height="32" viewBox="0 0 32 32" class="size-6 shrink-0 grow-0 fill-black" fill="white" xmlns="http://www.w3.org/2000/svg" class="size-6 shrink-0 grow-0 fill-black"><path d="M5.00215 17.5057L12.6433 13.9772C13.2297 13.7058 13.7024 13.233 13.9737 12.6464L17.5011 5.00286L21.0285 12.6464C21.2998 13.233 21.7724 13.7058 22.3589 13.9772L30 17.5057L22.3589 21.0342C21.7724 21.3056 21.2998 21.7784 21.0285 22.365L17.5011 30.0085L13.9737 22.365C13.7024 21.7784 13.2297 21.3056 12.6433 21.0342L4.9934 17.5057H5.00215Z"></path><path d="M2 7.37587L5.29104 5.86117C5.54487 5.74735 5.74618 5.54597 5.85997 5.29207L7.37419 2L8.88842 5.29207C9.0022 5.54597 9.20352 5.74735 9.45735 5.86117L12.7484 7.37587L9.45735 8.89057C9.20352 9.0044 9.0022 9.20577 8.88842 9.45968L7.37419 12.7517L5.85997 9.46844C5.74618 9.21453 5.54487 9.01315 5.29104 8.89933L2 7.38463V7.37587Z"></path></svg>
							<div class="relative flex h-full grow flex-col justify-center">
								<span class="text-sm font-medium leading-5 absolute left-0">It's your ${months} month sub anniversary!</span>
							</div>
						</div>

						<div class="flex h-full flex-row flex-nowrap items-center gap-2 empty:hidden ml-auto shrink-0 grow-0">
							<button class="group inline-flex gap-1.5 items-center justify-center rounded font-semibold box-border relative transition-all betterhover:active:scale-[0.98] disabled:pointer-events-none select-none whitespace-nowrap [&amp;_svg]:size-[1em] outline-transparent outline outline-2 outline-offset-2 focus-visible:outline-grey-300 text-white [&amp;_svg]:fill-current focus-visible:bg-secondary/40 disabled:bg-transparent disabled:opacity-30 px-3 py-1.5 text-sm betterhover:hover:bg-surface-base bg-surface-tint" dir="ltr">Share</button>
							<button class="group relative box-border flex shrink-0 grow-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded font-semibold ring-0 transition-all focus-visible:outline-none active:scale-[0.95] disabled:pointer-events-none [&amp;_svg]:size-[1em] bg-transparent focus-visible:outline-grey-300 [&amp;_svg]:fill-current lg:data-[state=open]:bg-surface-tint data-[state=active]:bg-surface-tint disabled:text-grey-600 disabled:bg-grey-1000 size-8 text-sm leading-none betterhover:hover:bg-black/10 text-black" data-state="closed" type="button" id="radix-:r8t:" aria-haspopup="menu" aria-expanded="true" aria-controls="radix-:r8u:" data-aria-hidden="true" aria-hidden="true"><svg width="32" height="32" viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M19 4H13V10H19V4Z" fill="current"></path><path d="M19 13H13V19H19V13Z" fill="current"></path><path d="M19 22H13V28H19V22Z" fill="current"></path></svg></button>
						</div>
					</div>
				`)
				)

				const shareBtn = celebrationEl.querySelector('button') as HTMLButtonElement
				const hamburgerBtn = celebrationEl.querySelector('button:last-child') as HTMLButtonElement

				shareBtn.addEventListener('click', () => {
					log('KICK', 'UI', 'Share button clicked')

					const message = inputController.contentEditableEditor.getMessageContent()
					this.session.networkInterface
						.sendCelebrationAction(celebration.id, message)
						.then(() => {
							log('KICK', 'UI', 'Celebration action sent')

							// Remove celebration
							;(celebrationEl as HTMLElement).remove()
							const celebrationId = celebration.id
							this.session.channelData.me.celebrations = celebrations.filter(c => c.id !== celebrationId)
						})
						.catch(err => {
							error('KICK', 'UI', 'Failed to send celebration action', err)
							this.toastError(err.message)
						})
				})

				hamburgerBtn.addEventListener('click', () => {
					log('KICK', 'UI', 'Hamburger button clicked')
				})

				celebrationsContainerEl.append(celebrationEl)
			}
		}

		placeholderEl.replaceWith(celebrationsContainerEl)
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
				// log('KICK', 'UI', 'Rendering chat messages..', queueLength)

				if (queueLength > 150) {
					log('KICK', 'UI', 'Chat message queue is too large, discarding overhead..', queueLength)
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
				log('KICK', 'UI', 'Chat message queue is too large, discarding overhead..', queue.length)
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
					if (emote) {
						const imageNode = parseHTML(
							this.session.emotesManager.getRenderableEmote(emote, '', true) as string,
							true
						) as HTMLElement

						imageNode.className = 'ntv__emote'
						tooltipEl.prepend(imageNode)
					} else {
						const imgEl = target.cloneNode(true) as HTMLElement
						imgEl.className = 'ntv__emote'
						imgEl.setAttribute('loading', 'lazy')
						imgEl.setAttribute('decoding', 'async')
						tooltipEl.prepend(imgEl)
					}
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
				if (!emoteHid) return

				const emote = this.session.emotesManager.getEmote(emoteHid)
				if (
					emote &&
					(!emote.isSubscribersOnly ||
						(emote.isSubscribersOnly &&
							this.session.emotesManager.getEmoteSetByEmoteHid(emoteHid)?.isSubscribed))
				)
					this.inputController?.contentEditableEditor.insertEmote(emoteHid)
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
						if (!innerWrapperEl) return error('KICK', 'UI', 'Inner wrapper element not found')

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
		log('KICK', 'UI', 'Loading VOD behaviour..')

		const chatroomParentContainerEl = document
			.getElementById('channel-chatroom')
			?.querySelector('& > .bg-surface-lower')
		if (!chatroomParentContainerEl) return error('KICK', 'UI', 'Chatroom container not found')

		this.addExistingMessagesToQueue()

		// The chatroom messages wrapper gets deleted when scrubbing the video player
		//  so we observe it and reload the chat UI when it gets re-added.
		const observer = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				if (mutation.addedNodes.length) {
					for (const node of mutation.addedNodes) {
						if (node instanceof HTMLElement && node.firstElementChild?.id === 'chatroom-messages') {
							log('KICK', 'UI', 'New chatroom messages container found, reloading chat UI..')

							const chatroomContainerEl = node.firstElementChild.querySelector('& > .no-scrollbar')
							this.elm.chatMessagesContainer = chatroomContainerEl as HTMLElement
							this.applyChatContainerClasses()

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
				log('KICK', 'UI', 'User info modal is already destroyed, cleaning up Kick modal..')
				destroyKickModal(kickUserInfoModalContainerEl)
				return
			}

			userInfoModal.addEventListener('destroy', () => {
				log('KICK', 'UI', 'Destroying modal..')
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
			if (!kickUserInfoModalContainerEl) return error('KICK', 'UI', 'Kick user profile modal container not found')

			processKickUserProfileModal(userInfoModal, kickUserInfoModalContainerEl)
		}
	}

	observePinnedMessage() {
		const pinnedMessageContainerEl = document
			.getElementById('channel-chatroom')
			?.querySelector(
				'& > .bg-surface-lower > .bg-surface-lower > .empty\\:hidden > .empty\\:hidden'
			) as HTMLElement
		if (!pinnedMessageContainerEl) return error('KICK', 'UI', 'Pinned message container not found for observation')

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

		const settingStyle = settingsManager.getSetting(channelId, 'chat.messages.style')
		const settingSeperator = settingsManager.getSetting(channelId, 'chat.messages.seperators')
		const settingSpacing = settingsManager.getSetting(channelId, 'chat.messages.spacing')

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

			const messageObject: ChatMessage = {
				username: '',
				createdAt: '',
				isReply: false,
				isReplyToMe: false,
				badges: [],
				content: [],
				style: {
					color: ''
				}
			}

			const ntvMessageInnerEl = document.createElement('div')

			const ntvIdentityWrapperEl = document.createElement('div')
			ntvIdentityWrapperEl.classList.add('ntv__chat-message__identity')

			let groupElementNode: Element | null | undefined = messageNode.firstElementChild
			if (!groupElementNode?.classList.contains('group')) groupElementNode = groupElementNode?.nextElementSibling

			if (!groupElementNode?.classList.contains('group')) {
				messageNode.classList.remove('ntv__chat-message--unrendered')
				error('KICK', 'UI', 'Chat message content wrapper node not found', messageNode)
				return
			}

			const betterHoverEl = groupElementNode.firstElementChild
			if (!betterHoverEl) {
				messageNode.classList.remove('ntv__chat-message--unrendered')
				error('KICK', 'UI', 'Better hover element not found')
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
				messageObject.isReply = true

				if (betterHoverEl.classList.contains('border-green-500')) {
					isReplyToMe = true
					messageObject.isReplyToMe = true
					messageNode.classList.add('ntv__chat-message--reply-to-me')
				}

				// Clone the reply message attachment to our chat message container
				const replyMessageAttachmentEl = betterHoverEl.firstElementChild
				if (!replyMessageAttachmentEl) {
					messageNode.classList.remove('ntv__chat-message--unrendered')
					error('KICK', 'UI', 'Reply message attachment element not found', messageNode)
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
				error('KICK', 'UI', 'Chat message body wrapper node not found', messageNode)
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
			const contentWrapperNode = messageBodyWrapper.querySelector('span:last-of-type')
			if (!contentWrapperNode) {
				messageNode.classList.remove('ntv__chat-message--unrendered')
				error('KICK', 'UI', 'Chat message content wrapper node not found', messageNode)
				return
			}

			let timestampEl = messageBodyWrapper.firstElementChild
			while (timestampEl && timestampEl.tagName !== 'SPAN') timestampEl = timestampEl.nextElementSibling
			if (!timestampEl) {
				messageNode.classList.remove('ntv__chat-message--unrendered')
				error('KICK', 'UI', 'Chat message timestamp node not found', messageNode)
				return
			}
			messageObject.createdAt = timestampEl.textContent || '00:00 AM'

			const ntvTimestampEl = document.createElement('span')
			ntvTimestampEl.className = 'ntv__chat-message__timestamp'
			ntvTimestampEl.textContent = messageObject.createdAt

			const identityEl = timestampEl?.nextElementSibling
			if (!identityEl) {
				messageNode.classList.remove('ntv__chat-message--unrendered')
				error('KICK', 'UI', 'Chat message identity node not found', messageNode)
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
							// messageObject.badges.push(subWrapperEl?.title || '')
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
				error('KICK', 'UI', 'Chat message username node not found', messageNode)
				return
			}

			const username = usernameEl.title
			messageObject.username = username
			messageObject.style.color = usernameEl.style.color

			const ntvUsernameEl = document.createElement('span')
			ntvUsernameEl.className = 'ntv__chat-message__username'
			ntvUsernameEl.title = username
			ntvUsernameEl.textContent = usernameEl.textContent || 'Unknown user'
			ntvUsernameEl.style.color = usernameEl.style.color

			if (!channelData.isVod && username) {
				if (usersManager.hasMutedUser(username)) {
					messageNode.classList.add('ntv__chat-message--muted')
					return
				}

				if (!usersManager.hasSeenUser(username)) {
					const enableFirstMessageHighlight = settingsManager.getSetting(
						channelId,
						'chat.messages.highlight_first_time'
					)
					const highlightWhenModeratorOnly = settingsManager.getSetting(
						channelId,
						'chat.messages.highlight_first_moderator'
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
				error('KICK', 'UI', 'Chat message separator node not found', separatorEl)
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
						error('KICK', 'UI', 'Emote image element not found', imgEl)
						continue
					}

					const emoteId = contentNode.getAttribute('data-emote-id')
					const emoteName = contentNode.getAttribute('data-emote-name')
					if (!emoteId || !emoteName) {
						error('KICK', 'UI', 'Emote ID or name not found', contentNode)
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

			const clipAttachmentEl = contentWrapperNode.nextElementSibling
			if (clipAttachmentEl && clipAttachmentEl.nodeName === 'BUTTON') {
				const clipPreviewBtnEl = clipAttachmentEl.cloneNode(true)
				// Forward the click event to the original clickable clip attachment preview element
				clipPreviewBtnEl.addEventListener('click', evt => {
					evt.preventDefault()
					evt.stopPropagation()
					evt.stopImmediatePropagation()

					const event = new MouseEvent('click', { bubbles: true, cancelable: true })
					Object.defineProperty(event, 'target', { value: clipAttachmentEl, enumerable: true })
					clipAttachmentEl.dispatchEvent(event)
				})
				messageParts.push(clipPreviewBtnEl)
			}

			messageObject.content = messageParts
			;(groupElementNode as HTMLElement).style.display = 'none'

			// const ntvMessagePartsWrapperEl = document.createElement('div')
			// ntvMessagePartsWrapperEl.className = 'ntv__chat-message__parts-wrapper'
			// ntvMessagePartsWrapperEl.append(...messagePartNodes)

			this.rootContext.renderMessagePipeline.process(messageObject, ntvBadgesEl, ntvUsernameEl, messageParts)

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

			// this.session.eventBus.publish('ntv.chat.message.new', messageObject)
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
				return error('KICK', 'UI', 'Unable to render message, message has no content loaded..') // messageNode
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
				error('KICK', 'UI', 'Chat message identity node not found', messageNode)
				return
			}

			const chatMessageWrapper = chatMessageIdentityEl.parentElement
			let timestampEl = chatMessageWrapper?.firstElementChild
			if (timestampEl && !timestampEl.classList.contains('text-gray-400')) timestampEl = null

			const modActionsEl =
				(timestampEl && timestampEl.nextElementSibling) || chatMessageWrapper?.firstElementChild
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
					error('KICK', 'UI', 'Badge image or svg element not found', imgOrSvgEl, subWrapperEl)
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
					// log('KICK', 'UI', 'Chat message component node not found. Are chat messages being rendered twice?', contentNode)
					continue
				}

				// We extract and flatten the Kick components to our format
				switch (componentNode.className) {
					case 'chat-entry-content':
						if (!componentNode.textContent) continue
						if (!(componentNode instanceof Element)) {
							error('KICK', 'UI', 'Chat message content node not an Element?', componentNode)
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
							error('KICK', 'UI', 'Emote ID or name not found', contentNode)
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
						else error('KICK', 'UI', 'Unknown chat message component', componentNode)
				}
			}

			const ntvMessageInnerEl = document.createElement('div')
			ntvMessageInnerEl.className = 'ntv__chat-message__inner'

			const ntvIdentityWrapperEl = document.createElement('div')
			ntvIdentityWrapperEl.classList.add('ntv__chat-message__identity')

			let ntvTimestampEl: HTMLElement | null = null
			if (timestampEl) {
				ntvTimestampEl = document.createElement('span')
				ntvTimestampEl.className = 'ntv__cha-tmessage__timestamp'
				ntvTimestampEl.textContent = timestampEl?.textContent || '00:00 AM'
			}

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
						'chat.messages.highlight_first_time'
					)
					const highlightWhenModeratorOnly = settingsManager.getSetting(
						channelId,
						'chat.messages.highlight_first_moderator'
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

			if (ntvTimestampEl) ntvIdentityWrapperEl.append(ntvTimestampEl)
			if (ntvModBtnsWrapperEl) ntvIdentityWrapperEl.append(ntvModBtnsWrapperEl)
			ntvIdentityWrapperEl.append(ntvBadgesEl, ntvUsernameEl, ntvSeparatorEl)
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
			const kickTextFieldEl = document.querySelector('.editor-input[contenteditable="true"]') as HTMLElement

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
			if (!replyPreviewWrapperEl) return error('KICK', 'UI', 'Reply preview wrapper element not found')

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
			if (!footerEl) return error('KICK', 'UI', 'Footer element not found')

			const textFieldParent = textFieldEl.parentElement!
			const intervalId = setInterval(() => {
				const closeReplyBtnEl = footerEl.querySelector('path[d*="M28 6.99204L25.008 4L16"]')
				if (!closeReplyBtnEl) {
					if (textFieldParent.style.display === 'none') restoreFields()
					clearInterval(intervalId)
				}
			}, 400)

			kickTextFieldEl?.focus()
		}
		// Chatroom is old Kick design in mod or creator view
		else {
		}
	}

	async handleMessageReplyBtnClick(messageNode: HTMLElement, fallbackButtonEl: HTMLElement) {
		const { inputController } = this
		const { channelData } = this.session
		if (!channelData.me.isLoggedIn) return

		if (channelData.isCreatorView || channelData.isModView)
			return this.loadNativeKickFallbackReplyBehaviour(fallbackButtonEl)

		const randomId = 'NTV' + Math.random().toString(36).substring(2, 11)
		messageNode.classList.add(randomId)

		const messageProps = await ReactivePropsFromMain.getByClassName(randomId)
		if (!messageProps) return this.loadNativeKickFallbackReplyBehaviour(fallbackButtonEl)

		const chatEntry = messageProps.chatEntry
		if (!chatEntry) return this.loadNativeKickFallbackReplyBehaviour(fallbackButtonEl)

		const { chat_id, content: messageContent, created_at, id: messageId, user_id, sender } = chatEntry.data
		if (!sender) return this.loadNativeKickFallbackReplyBehaviour(fallbackButtonEl)

		const { id: senderId, slug: senderSlug, username: senderUsername } = sender
		if (!senderId || !senderUsername) return this.loadNativeKickFallbackReplyBehaviour(fallbackButtonEl)

		if (!inputController) return error('KICK', 'UI', 'Input controller not loaded for reply behaviour')

		// Handle the reply message UI
		const replyMessageWrapperEl = document.createElement('div')
		replyMessageWrapperEl.classList.add('ntv__reply-message__wrapper')
		document.querySelector('#chat-input-wrapper')?.parentElement?.prepend(replyMessageWrapperEl)
		this.elm.replyMessageWrapper = replyMessageWrapperEl

		const msgInnerEl = messageNode.querySelector('.ntv__chat-message__inner')
		if (!msgInnerEl) {
			error('KICK', 'UI', 'Message inner element not found', messageNode)
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
		log('KICK', 'UI', 'Rendering pinned message..')

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
					error('KICK', 'UI', 'Emote ID or name not found', childNode)
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
				error('KICK', 'UI', 'Unknown node found for pinned message', childNode)
				parsedEmoteParts.push(childNode.cloneNode(true))
			}
		}

		ntvPinnedMessageBodyEl.append(...this.renderMessageParts(parsedEmoteParts))
		contentBodyEl.before(ntvPinnedMessageBodyEl)
	}

	insertNodesInChat(embedNodes: Node[]) {
		if (!embedNodes.length) return error('KICK', 'UI', 'No nodes to insert in chat')

		const textFieldEl = this.elm.textField
		if (!textFieldEl) return error('KICK', 'UI', 'Text field not loaded for inserting node')

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
			return error('KICK', 'UI', 'Invalid node type', embedNode)
		}

		const textFieldEl = this.elm.textField
		if (!textFieldEl) return error('KICK', 'UI', 'Text field not loaded for inserting node')

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
	}

	restoreOriginalUi() {
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
