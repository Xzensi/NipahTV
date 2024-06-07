import type { InputController } from '../Managers/InputController'
import { ReplyMessageComponent } from './Components/ReplyMessageComponent'
import { MessagesHistory } from '../Classes/MessagesHistory'
import { UserInfoModal } from './Modals/UserInfoModal'
import { Clipboard2 } from '../Classes/Clipboard'
import { assertArgDefined, cleanupHTML, error, log, parseHTML } from '../utils'
import { Toaster } from '../Classes/Toaster'
import { PollModal } from './Modals/PollModal'

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
	}

	toastError(message: string) {
		error(message)
		this.toaster.addToast(message, 4_000, 'error')
	}

	renderEmotesInElement(textElement: Element, appendTo?: Element) {
		const { emotesManager } = this.rootContext
		const text = textElement.textContent || ''
		const tokens = text.split(' ')
		const newNodes = []

		let textBuffer = ''
		for (const token of tokens) {
			const emoteHid = emotesManager.getEmoteHidByName(token)
			if (emoteHid) {
				if (textBuffer) {
					const newNode = document.createElement('span')
					newNode.appendChild(document.createTextNode(textBuffer.trim()))
					newNode.classList.add('ntv__chat-message__part', 'ntv__chat-message--text')
					newNodes.push(newNode)
					textBuffer = ''
				}

				const newNode = document.createElement('span')
				newNode.innerHTML = emotesManager.getRenderableEmoteByHid(emoteHid)
				newNode.classList.add('ntv__chat-message__part', 'ntv__inline-emote-box')
				newNode.setAttribute('data-emote-hid', emoteHid)
				newNode.setAttribute('contenteditable', 'false')
				newNodes.push(newNode)
			} else if (token) {
				textBuffer += token + ' '
			}
		}

		if (textBuffer) {
			const newNode = document.createElement('span')
			newNode.appendChild(document.createTextNode(textBuffer.trim()))
			newNode.classList.add('ntv__chat-message__part', 'ntv__chat-message--text')
			newNodes.push(newNode)
		}

		if (appendTo) appendTo.append(...newNodes)
		else textElement.after(...newNodes)
		textElement.remove()
	}

	showUserInfoModal(username: string) {
		log('Showing user info modal..')
		const modal = new UserInfoModal(
			this.rootContext,
			this.session,
			{
				toaster: this.toaster
			},
			username
		).init()
	}

	// Submits input to chat
	submitInput(suppressEngagementEvent?: boolean) {
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
		contentEditableEditor.clearInput()
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
