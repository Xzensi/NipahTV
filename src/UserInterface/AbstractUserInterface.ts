import { assertArgDefined, cleanupHTML, error, log, parseHTML } from '../utils'
import { ReplyMessageComponent } from './Components/ReplyMessageComponent'
import type { KickEmoteProvider } from '../Providers/KickEmoteProvider'
import { PriorityEventTarget } from '../Classes/PriorityEventTarget'
import type { InputController } from '../Classes/InputController'
import { PROVIDER_ENUM, U_TAG_NTV_AFFIX } from '../constants'
import { MessagesHistory } from '../Classes/MessagesHistory'
import { TimerComponent } from './Components/TimerComponent'
import { parse as twemojiParse } from '@twemoji/parser'
import { UserInfoModal } from './Modals/UserInfoModal'
import { PollModal } from './Modals/PollModal'
import { Toaster } from '../Classes/Toaster'
import Clipboard2 from '../Classes/Clipboard'

const emoteMatcherRegex = /\[emote:([0-9]+):(?:[^\]]+)?\]|([^\[\]\s]+)/g

export abstract class AbstractUserInterface {
	protected rootContext: RootContext
	protected session: Session

	protected inputController: InputController | null = null
	protected clipboard = new Clipboard2()
	protected toaster = new Toaster()
	protected messageHistory = new MessagesHistory()
	protected submitButtonPriorityEventTarget = new PriorityEventTarget()

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

	getInputController() {
		return this.inputController
	}

	loadInterface() {
		const { eventBus } = this.session

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
			const tooltip = target?.getAttribute('ntv-tooltip')
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
		this.toaster.addToast(message.replaceAll('<', '&lt;'), 6_000, 'success')
	}

	toastError(message: string) {
		error(message)
		this.toaster.addToast(message.replaceAll('<', '&lt;'), 6_000, 'error')
	}

	renderEmotesInString(textContent: string) {
		const { emotesManager } = this.session
		const newNodes: Array<Text | HTMLElement> = []

		if (textContent.endsWith(U_TAG_NTV_AFFIX)) {
			textContent = textContent.slice(0, (1 + U_TAG_NTV_AFFIX.length) * -1)
		}

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
		const emojiEntries = twemojiParse(textContent)
		if (emojiEntries.length) {
			const totalEmojis = emojiEntries.length
			let lastIndex = 0

			for (let i = 0; i < totalEmojis; i++) {
				const emojiData = emojiEntries[i]
				const emojiNode = document.createElement('img')
				emojiNode.className = 'ntv__chat-message__part ntv__inline-emoji'
				emojiNode.src = emojiData.url
				emojiNode.alt = emojiData.text

				// Get the string before the current emoji based on the last index processed
				const stringStart = textContent.slice(lastIndex, emojiData.indices[0])

				if (stringStart) {
					resultArray.push(this.createPlainTextMessagePartNode(stringStart))
				}
				resultArray.push(emojiNode)

				// Update lastIndex to the end of the current emoji
				lastIndex = emojiData.indices[1]
			}

			// After the loop, add any remaining text that comes after the last emoji
			const remainingText = textContent.slice(lastIndex)
			if (remainingText) {
				resultArray.push(this.createPlainTextMessagePartNode(remainingText))
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
		const { eventBus, inputExecutionStrategyRegister } = this.session
		const contentEditableEditor = this.inputController?.contentEditableEditor
		if (!contentEditableEditor) return error('Unable to submit input, the input controller is not loaded yet.')

		// 14 is the magic number of encoded unicode message tag
		if (contentEditableEditor.getCharacterCount() > this.maxMessageLength - 14) {
			return this.toastError('Message is too long to send.')
		}

		const replyContent = contentEditableEditor.getMessageContent()
		if (!replyContent.length) return log('No message content to send.')

		if (this.replyMessageData) {
			const { chatEntryId, chatEntryContentString, chatEntryUserId, chatEntryUsername } = this.replyMessageData

			inputExecutionStrategyRegister
				.routeInput({
					input: replyContent,
					isReply: true,
					replyRefs: {
						messageId: chatEntryId,
						messageContent: chatEntryContentString,
						senderId: chatEntryUserId,
						senderUsername: chatEntryUsername
					}
				})
				.then(successMessage => {
					if (successMessage) {
						if (typeof successMessage !== 'string')
							throw new Error('Success message returned by input execution strategy is not a string.')
						this.toastSuccess(successMessage)
					}

					eventBus.publish('ntv.ui.input_submitted', { suppressEngagementEvent })

					dontClearInput || contentEditableEditor.clearInput()
				})
				.catch(err => {
					if (err && err.message) this.toastError(err.message)
					else this.toastError('Failed to reply to message. Reason unknown.')
				})

			this.destroyReplyMessageContext()
		} else {
			inputExecutionStrategyRegister
				.routeInput({
					input: replyContent,
					isReply: false
				})
				.then(successMessage => {
					if (successMessage) {
						if (typeof successMessage !== 'string')
							throw new Error('Success message returned by input execution strategy is not a string.')
						this.toastSuccess(successMessage)
					}

					eventBus.publish('ntv.ui.input_submitted', { suppressEngagementEvent })

					dontClearInput || contentEditableEditor.clearInput()
				})
				.catch(err => {
					if (err && err.message) this.toastError(err.message)
					else this.toastError('Failed to send message. Reason unknown.')
				})
		}
	}

	sendEmoteToChat(emoteHid: string) {
		const { emotesManager, inputExecutionStrategyRegister } = this.session
		const emoteEmbedding = emotesManager.getEmoteEmbeddable(emoteHid)
		if (!emoteEmbedding) return error('Failed to send emote to chat, emote embedding not found.')

		inputExecutionStrategyRegister
			.routeInput({
				input: emoteEmbedding,
				isReply: false
			})
			.catch(err => {
				if (err) this.toastError('Failed to send emote because: ' + err)
				else this.toastError('Failed to send emote to chat. Reason unknown.')
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
