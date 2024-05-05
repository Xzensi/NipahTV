import type { AbstractNetworkInterface } from '../NetworkInterfaces/AbstractNetworkInterface'
import type { SettingsManager } from '../Managers/SettingsManager'
import type { EmotesManager } from '../Managers/EmotesManager'
import type { Publisher } from '../Classes/Publisher'
import { MessagesHistory } from '../Classes/MessagesHistory'
import { UsersManager } from '../Managers/UsersManager'
import { assertArgDefined, log } from '../utils'
import { UserInfoModal } from './Modals/UserInfoModal'

export abstract class AbstractUserInterface {
	protected ENV_VARS: any
	protected channelData: ChannelData
	protected eventBus: Publisher
	protected networkInterface: AbstractNetworkInterface
	protected settingsManager: SettingsManager
	protected emotesManager: EmotesManager
	protected usersManager: UsersManager

	protected messageHistory = new MessagesHistory()

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
		emotesManager
	}: {
		ENV_VARS: any
		channelData: ChannelData
		eventBus: Publisher
		networkInterface: AbstractNetworkInterface
		settingsManager: SettingsManager
		emotesManager: EmotesManager
	}) {
		assertArgDefined(ENV_VARS)
		assertArgDefined(channelData)
		assertArgDefined(eventBus)
		assertArgDefined(networkInterface)
		assertArgDefined(settingsManager)
		assertArgDefined(emotesManager)

		this.ENV_VARS = ENV_VARS
		this.channelData = channelData
		this.eventBus = eventBus
		this.networkInterface = networkInterface
		this.settingsManager = settingsManager
		this.emotesManager = emotesManager
		this.usersManager = new UsersManager({ eventBus, settingsManager })
	}

	loadInterface() {
		const { eventBus } = this

		eventBus.subscribe('ntv.ui.show_modal.user_info', (data: { username: string }) => {
			assertArgDefined(data.username)
			this.showUserInfoModal(data.username)
		})
	}

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
				userInterface: this
			},
			this.channelData,
			username
		).init()
	}

	abstract renderChatMessage(messageNode: HTMLElement): void
}
