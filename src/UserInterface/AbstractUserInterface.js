import { MessagesHistory } from '../Classes/MessagesHistory'
import { UsersManager } from '../Managers/UsersManager'
import { assertArgDefined } from '../utils'

export class AbstractUserInterface {
	messageHistory = new MessagesHistory()

	/**
	 * @param {EventBus} eventBus
	 * @param {object} deps
	 */
	constructor({ ENV_VARS, channelData, eventBus, settingsManager, emotesManager }) {
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

	renderEmotesInText(text) {
		const { emotesManager } = this
		const tokens = text.split(' ')
		// const uniqueTokens = [...new Set(tokens)]

		// text = replaceText || text

		// for (const token of uniqueTokens) {
		// 	const emoteId = emotesManager.getEmoteIdByName(token)

		// 	if (emoteId) {
		// 		const emoteRender = emotesManager.getRenderableEmoteById(emoteId, 'chat-emote')
		// 		text = text.replace(
		// 			`/\b(${token})\b/gm`, // Doesn't work because its a string not regex
		// 			`<div class="nipah__emote-box" data-emote-id="${emoteId}">${emoteRender}</div>`
		// 		)
		// 	}
		// }

		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i]
			const emoteHid = emotesManager.getEmoteHidByName(token)
			if (emoteHid) {
				const emoteRender = emotesManager.getRenderableEmoteByHid(emoteHid, 'chat-emote')
				tokens[i] = `<div class="nipah__emote-box" data-emote-hid="${emoteHid}">${emoteRender}</div>`
			}
		}

		return tokens.join(' ')
	}
}
