import { SettingsManager } from '../Managers/SettingsManager'
import { MessagesHistory } from '../Classes/MessagesHistory'
import { EmotesManager } from '../Managers/EmotesManager'
import { UsersManager } from '../Managers/UsersManager'
import { Publisher } from '../Classes/Publisher'
import { assertArgDefined, log } from '../utils'

export class AbstractUserInterface {
	messageHistory = new MessagesHistory()

	ENV_VARS: any
	channelData: ChannelData
	eventBus: Publisher
	settingsManager: SettingsManager
	emotesManager: EmotesManager
	usersManager: UsersManager

	/**
	 * @param {EventBus} eventBus
	 * @param {object} deps
	 */
	constructor({
		ENV_VARS,
		channelData,
		eventBus,
		settingsManager,
		emotesManager
	}: {
		ENV_VARS: any
		channelData: ChannelData
		eventBus: Publisher
		settingsManager: SettingsManager
		emotesManager: EmotesManager
	}) {
		assertArgDefined(ENV_VARS)
		assertArgDefined(channelData)
		assertArgDefined(eventBus)
		assertArgDefined(settingsManager)
		assertArgDefined(emotesManager)

		this.ENV_VARS = ENV_VARS
		this.channelData = channelData
		this.eventBus = eventBus
		this.settingsManager = settingsManager
		this.emotesManager = emotesManager
		this.usersManager = new UsersManager({ eventBus, settingsManager })
	}

	loadInterface() {
		throw new Error('loadInterface() not implemented')
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
}
