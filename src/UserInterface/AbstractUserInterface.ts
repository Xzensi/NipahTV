import type { AbstractNetworkInterface } from '../NetworkInterfaces/AbstractNetworkInterface'
import type { InputController } from '../Managers/InputController'
import type { SettingsManager } from '../Managers/SettingsManager'
import type { EmotesManager } from '../Managers/EmotesManager'
import type { UsersManager } from '../Managers/UsersManager'
import type { Publisher } from '../Classes/Publisher'
import { ReplyMessageComponent } from './Components/ReplyMessageComponent'
import { MessagesHistory } from '../Classes/MessagesHistory'
import { UserInfoModal } from './Modals/UserInfoModal'
import { Clipboard2 } from '../Classes/Clipboard'
import { assertArgDefined, cleanupHTML, error, log, parseHTML } from '../utils'
import { Toaster } from '../Classes/Toaster'

export abstract class AbstractUserInterface {
	protected ENV_VARS: any
	protected channelData: ChannelData
	protected eventBus: Publisher
	protected networkInterface: AbstractNetworkInterface
	protected settingsManager: SettingsManager
	protected emotesManager: EmotesManager
	protected usersManager: UsersManager

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
	constructor({
		ENV_VARS,
		channelData,
		eventBus,
		networkInterface,
		settingsManager,
		emotesManager,
		usersManager
	}: {
		ENV_VARS: any
		channelData: ChannelData
		eventBus: Publisher
		networkInterface: AbstractNetworkInterface
		settingsManager: SettingsManager
		emotesManager: EmotesManager
		usersManager: UsersManager
	}) {
		this.ENV_VARS = ENV_VARS
		this.channelData = channelData
		this.eventBus = eventBus
		this.networkInterface = networkInterface
		this.settingsManager = settingsManager
		this.emotesManager = emotesManager
		this.usersManager = usersManager
	}

	loadInterface() {
		const { eventBus } = this

		eventBus.subscribe('ntv.ui.show_modal.user_info', (data: { username: string }) => {
			assertArgDefined(data.username)
			this.showUserInfoModal(data.username)
		})
	}

	getRenderedMessageLine() {}

	renderEmotesInElement(textElement: Element, appendTo?: Element) {
		const { emotesManager } = this
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
			{
				ENV_VARS: this.ENV_VARS,
				eventBus: this.eventBus,
				networkInterface: this.networkInterface,
				toaster: this.toaster,
				userInterface: this
			},
			this.channelData,
			username
		).init()
	}

	// Submits input to chat
	submitInput(suppressEngagementEvent?: boolean) {
		const { eventBus } = this
		const contentEditableEditor = this.inputController?.contentEditableEditor
		if (!contentEditableEditor) return error('Unable to submit input, the input controller is not loaded yet.')

		if (contentEditableEditor.getCharacterCount() > this.maxMessageLength) {
			error(
				`Message too long, it is ${contentEditableEditor.getCharacterCount()} characters but max limit is ${
					this.maxMessageLength
				}.`
			)
			this.toaster.addToast('Message is too long to send.', 4_000, 'error')
			return
		}

		const replyContent = contentEditableEditor.getMessageContent()
		if (!replyContent.length) return

		if (this.replyMessageData) {
			const { chatEntryId, chatEntryContentString, chatEntryUserId, chatEntryUsername } = this.replyMessageData
			this.networkInterface
				.sendReply(replyContent, chatEntryId, chatEntryContentString, chatEntryUserId, chatEntryUsername)
				.then(res => {
					if (res.status.error) {
						if (res.status.message)
							this.toaster.addToast(
								'Failed to send reply message because: ' + res.status.message,
								5_000,
								'error'
							)
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
			this.networkInterface
				.sendMessage(replyContent)
				.then(res => {
					if (res.status.error) {
						if (res.status.message)
							this.toaster.addToast(
								'Failed to send message because: ' + res.status.message,
								5_000,
								'error'
							)
						else this.toaster.addToast('Failed to send message.', 4_000, 'error')
						error('Failed to send message:', res.status)
					}
				})
				.catch(err => {
					this.toaster.addToast('Failed to send message.', 4_000, 'error')
					error('Failed to send message:', err)
				})
		}

		eventBus.publish('ntv.ui.input_submitted', { suppressEngagementEvent })
		contentEditableEditor.clearInput()
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

		if (this.replyMessageComponent) {
			this.destroyReplyMessageContext()
		}

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
