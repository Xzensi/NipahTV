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
		replyMessageComponent?: HTMLElement
	}

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

		this.elm.replyMessageComponent?.remove()
		delete this.replyMessageData
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

		if (this.replyMessageData) {
			this.elm.replyMessageComponent?.remove()
			delete this.replyMessageData
		}

		this.replyMessageData = {
			chatEntryId,
			chatEntryContentString,
			chatEntryUsername,
			chatEntryUserId
		}

		const replyMessageEl = (this.elm.replyMessageComponent = parseHTML(
			cleanupHTML(`
			<div class="ntv__reply-message">
				<div class="ntv__reply-message__header">
					<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
						<path fill="currentColor" d="M9 16h7.2l-2.6 2.6L15 20l5-5l-5-5l-1.4 1.4l2.6 2.6H9c-2.2 0-4-1.8-4-4s1.8-4 4-4h2V4H9c-3.3 0-6 2.7-6 6s2.7 6 6 6" />
					</svg>
					<span>Replying to:</span>
					<svg class="ntv__reply-message__close-btn ntv__icon-button" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 50 50">
						<path fill="currentColor" d="m37.304 11.282l1.414 1.414l-26.022 26.02l-1.414-1.413z" />
						<path fill="currentColor" d="m12.696 11.282l26.022 26.02l-1.414 1.415l-26.022-26.02z" />
					</svg>
				</div>
				<div class="ntv__reply-message__content">
				</div>
			</div>
		`),
			true
		) as HTMLElement)

		const closeBtn = replyMessageEl.querySelector('.ntv__reply-message__close-btn')!
		closeBtn.addEventListener('click', () => {
			replyMessageEl.remove()
			delete this.elm.replyMessageComponent
			delete this.replyMessageData
		})

		const contentEl = replyMessageEl.querySelector('.ntv__reply-message__content')!

		for (const messageNode of messageNodes) {
			contentEl.append(messageNode.cloneNode(true))
		}

		this.elm.replyMessageWrapper.append(replyMessageEl)
	}

	abstract renderChatMessage(messageNode: HTMLElement): void
}
