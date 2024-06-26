import { assertArgDefined, cleanupHTML, error, log, parseHTML } from '../utils'
import { ReplyMessageComponent } from './Components/ReplyMessageComponent'
import type { KickEmoteProvider } from '../Providers/KickEmoteProvider'
import type { InputController } from '../Managers/InputController'
import { MessagesHistory } from '../Classes/MessagesHistory'
import { parse as twemojiParse } from '@twemoji/parser'
import { UserInfoModal } from './Modals/UserInfoModal'
import { Clipboard2 } from '../Classes/Clipboard'
import { Toaster } from '../Classes/Toaster'
import { PollModal } from './Modals/PollModal'
import { PROVIDER_ENUM } from '../constants'
import { TimerComponent } from './Components/TimerComponent'

const emoteMatcherRegex = /\[emote:([0-9]+):(?:[^\]]+)?\]|([^\[\s]+)/g

export abstract class AbstractUserInterface {
	protected rootContext: RootContext
	protected session: Session

	protected inputController: InputController | null = null
	protected clipboard = new Clipboard2()
	protected toaster = new Toaster()
	protected messageHistory = new MessagesHistory()

	protected replyMessageData?: {
		chatEntryId: string
		chatEntryContentString: string
		chatEntryUsername: string
		chatEntryUserId: string
	}

	protected abstract elm: {
		replyMessageWrapper: HTMLElement | null
		timersContainer: HTMLElement | null
	}

	protected replyMessageComponent?: ReplyMessageComponent

	protected maxMessageLength = 500

	/**
	 * @param {EventBus} eventBus
	 * @param {object} deps
	 */
	constructor(rootContext: RootContext, session: Session) {
		this.rootContext = rootContext
		this.session = session
	}

	loadInterface() {
		const { eventBus } = this.rootContext

		eventBus.subscribe('ntv.ui.show_modal.user_info', (data: { username: string }) => {
			assertArgDefined(data.username)
			this.showUserInfoModal(data.username)
		})

		eventBus.subscribe('ntv.ui.show_modal.poll', () => {
			new PollModal(this.rootContext, this.session, { toaster: this.toaster }).init()
		})

		// Render ntv-tooltip tooltips
		document.addEventListener('mouseover', evt => {
			const target = evt.target as HTMLElement
			const tooltip = target.getAttribute('ntv-tooltip')
			if (!tooltip) return

			const rect = target.getBoundingClientRect()
			const left = rect.left + rect.width / 2
			const top = rect.top

			const tooltipEl = parseHTML(
				`<div class="ntv__tooltip" style="top: ${top}px; left: ${left}px;">${tooltip}</div>`,
				true
			) as HTMLElement

			document.body.appendChild(tooltipEl)

			target.addEventListener(
				'mouseleave',
				() => {
					tooltipEl.remove()
				},
				{ once: true, passive: true }
			)
		})

		eventBus.subscribe('ntv.ui.timers.add', this.addTimer.bind(this))
	}

	toastSuccess(message: string) {
		this.toaster.addToast(message, 4_000, 'success')
	}

	toastError(message: string) {
		error(message)
		this.toaster.addToast(message, 4_000, 'error')
	}

	renderEmotesInString(textContent: string) {
		const { emotesManager } = this.rootContext
		const newNodes: Array<Text | HTMLElement> = []

		// TODO create abstraction layer for kick emote matching and rendering

		let match,
			lastIndex = 0,
			textBuffer = ''
		while ((match = emoteMatcherRegex.exec(textContent)) !== null) {
			/**
			 * Kick emote format is like [emote:1234567:name]
			 * Plaintext emote is just a word like "vibee"
			 */
			const [matchedText, kickEmoteFormatMatch, plainTextEmote] = match

			if (lastIndex === 0 && match.index > 0) {
				this.parseEmojisInString(textContent.slice(0, match.index), newNodes)
			}

			if (kickEmoteFormatMatch) {
				if (textBuffer) {
					this.parseEmojisInString(textBuffer, newNodes)
					textBuffer = ''
				}

				// Handle new emote format: Extract ID and name
				const emote = emotesManager.getEmoteById(kickEmoteFormatMatch)
				if (emote) {
					const emoteRender = emotesManager.getRenderableEmote(emote)!
					newNodes.push(this.createEmoteMessagePartElement(emoteRender, emote.hid))
				} else {
					const kickProvider = emotesManager.getProvider(PROVIDER_ENUM.KICK) as KickEmoteProvider
					const emoteRender = kickProvider.getRenderableEmoteById(kickEmoteFormatMatch)
					newNodes.push(this.createEmoteMessagePartElement(emoteRender, ''))
				}
			} else if (plainTextEmote) {
				// Check if word is plain text emote
				const emoteHid = emotesManager.getEmoteHidByName(plainTextEmote)
				if (emoteHid) {
					const emoteRender = emotesManager.getRenderableEmoteByHid(emoteHid)
					if (emoteRender) {
						if (textBuffer) {
							this.parseEmojisInString(textBuffer, newNodes)
							textBuffer = ''
						}

						newNodes.push(this.createEmoteMessagePartElement(emoteRender, emoteHid))
					}
				} else {
					// Plain text emote not found, treat as text node
					textBuffer += textContent.slice(lastIndex, match.index + plainTextEmote.length)
				}
			}

			lastIndex = emoteMatcherRegex.lastIndex
		}

		if (lastIndex > 0 && lastIndex < textContent.length) {
			this.parseEmojisInString(textBuffer + textContent.slice(lastIndex), newNodes)
		} else if (textBuffer) {
			this.parseEmojisInString(textBuffer, newNodes)
		} else if (lastIndex === 0) {
			this.parseEmojisInString(textContent, newNodes)
		}

		return newNodes
	}

	private parseEmojisInString(textContent: string, resultArray: Array<Text | HTMLElement> = []) {
		const entities = twemojiParse(textContent)
		if (entities.length) {
			const entitiesLength = entities.length
			for (let i = 0; i < entitiesLength; i++) {
				const entity = entities[i]
				const emojiNode = document.createElement('img')
				emojiNode.className = 'ntv__inline-emoji'
				emojiNode.src = entity.url
				emojiNode.alt = entity.text

				const stringStart = textContent.slice(entities[i - 1]?.indices[1] || 0, entity.indices[0])
				const stringEnd = textContent.slice(
					entity.indices[1],
					entities[i + 1]?.indices[0] || textContent.length
				)

				resultArray.push(this.createPlainTextMessagePartNode(stringStart))
				resultArray.push(emojiNode)
				resultArray.push(this.createPlainTextMessagePartNode(stringEnd))
			}
		} else {
			resultArray.push(this.createPlainTextMessagePartNode(textContent))
		}

		return resultArray
	}

	private createEmoteMessagePartElement(emoteRender: string, emoteHid: string) {
		const node = document.createElement('span')
		node.appendChild(parseHTML(emoteRender, true))
		node.classList.add('ntv__chat-message__part', 'ntv__inline-emote-box')
		node.setAttribute('data-emote-hid', emoteHid)
		node.setAttribute('contenteditable', 'false')
		return node
	}

	private createPlainTextMessagePartNode(textContent: string) {
		const newNode = document.createElement('span')
		newNode.append(document.createTextNode(textContent))
		newNode.className = 'ntv__chat-message__part ntv__chat-message--text'
		return newNode
	}

	changeInputStatus(status: 'enabled' | 'disabled', reason?: string | null) {
		if (!this.inputController) return error('Input controller not loaded yet.')
		const contentEditableEditor = this.inputController.contentEditableEditor

		if (status === 'enabled') {
			contentEditableEditor.enableInput()
			contentEditableEditor.setPlaceholder('Send message..')
		} else if (status === 'disabled') {
			contentEditableEditor.clearInput()
			contentEditableEditor.setPlaceholder(reason || 'Chat is disabled')
			contentEditableEditor.disableInput()
		}
	}

	showUserInfoModal(username: string, position?: { x: number; y: number }) {
		log('Loading user info modal..')
		return new UserInfoModal(
			this.rootContext,
			this.session,
			{
				toaster: this.toaster
			},
			username,
			position
		).init()
	}

	addTimer({ duration, description }: { duration: string; description: string }) {
		log('Adding timer..', duration, description)
		const timersContainer = this.elm.timersContainer
		if (!timersContainer) return error('Unable to add timet, UI container does not exist yet.')

		// Add a timer component to the timers container
		const timer = new TimerComponent(duration, description).init()
		timersContainer.appendChild(timer.element)
	}

	// Submits input to chat
	submitInput(suppressEngagementEvent?: boolean, dontClearInput?: boolean) {
		const { eventBus, networkInterface } = this.rootContext
		const contentEditableEditor = this.inputController?.contentEditableEditor
		if (!contentEditableEditor) return error('Unable to submit input, the input controller is not loaded yet.')

		if (contentEditableEditor.getCharacterCount() > this.maxMessageLength) {
			return this.toastError('Message is too long to send.')
		}

		const replyContent = contentEditableEditor.getMessageContent()
		if (!replyContent.length) return log('No message content to send.')

		if (this.replyMessageData) {
			const { chatEntryId, chatEntryContentString, chatEntryUserId, chatEntryUsername } = this.replyMessageData
			networkInterface
				.sendReply(replyContent, chatEntryId, chatEntryContentString, chatEntryUserId, chatEntryUsername)
				.then(res => {
					if (res.status.error) {
						if (res.status.message)
							this.toastError('Failed to send reply message because: ' + res.status.message)
						else this.toaster.addToast('Failed to send reply message.', 4_000, 'error')
						error('Failed to send reply message:', res.status)
					}
				})
				.catch(err => {
					this.toaster.addToast('Failed to send reply message.', 4_000, 'error')
					error('Failed to send reply message:', err)
				})

			this.destroyReplyMessageContext()
		} else {
			networkInterface
				.sendMessage(replyContent)
				.then(res => {
					if (res?.status.error) {
						if (res.status.message) this.toastError('Failed to send message because: ' + res.status.message)
						else this.toaster.addToast('Failed to send message.', 4_000, 'error')
						error('Failed to send message:', res.status)
					}
				})
				.catch(err => {
					this.toaster.addToast('Failed to send emote to chat.', 4_000, 'error')
					error('Failed to send emote to chat:', err)
				})
		}

		eventBus.publish('ntv.ui.input_submitted', { suppressEngagementEvent })

		dontClearInput || contentEditableEditor.clearInput()
	}

	sendEmoteToChat(emoteHid: string) {
		const { emotesManager, networkInterface } = this.rootContext
		const emoteEmbedding = emotesManager.getEmoteEmbeddable(emoteHid)
		if (!emoteEmbedding) return error('Failed to send emote to chat, emote embedding not found.')

		networkInterface
			.sendMessage(emoteEmbedding)
			.then(res => {
				if (res?.status.error) {
					if (res.status.message) this.toastError('Failed to send emote because: ' + res.status.message)
					else this.toaster.addToast('Failed to send emote to chat.', 4_000, 'error')
					error('Failed to send emote to chat:', res.status)
				}
			})
			.catch(err => {
				this.toastError('Failed to send emote to chat.')
			})
	}

	replyMessage(
		messageNodes: Element[],
		chatEntryId: string,
		chatEntryContentString: string,
		chatEntryUserId: string,
		chatEntryUsername: string
	) {
		log(`Replying to message ${chatEntryId} of user ${chatEntryUsername} with ID ${chatEntryUserId}..`)

		if (!this.inputController) return error('Input controller not loaded for reply behaviour')
		if (!this.elm.replyMessageWrapper) return error('Unable to load reply message, reply message wrapper not found')
		if (this.replyMessageData) this.destroyReplyMessageContext()

		this.replyMessageData = {
			chatEntryId,
			chatEntryContentString,
			chatEntryUsername,
			chatEntryUserId
		}

		this.replyMessageComponent = new ReplyMessageComponent(this.elm.replyMessageWrapper, messageNodes).init()
		this.replyMessageComponent.addEventListener('close', () => {
			this.destroyReplyMessageContext()
		})
	}

	destroyReplyMessageContext() {
		this.replyMessageComponent?.destroy()
		delete this.replyMessageComponent
		delete this.replyMessageData
	}

	abstract renderChatMessage(messageNode: HTMLElement): void
}
