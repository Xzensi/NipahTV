import { MessagesHistory } from '../Classes/MessagesHistory'
import { UsersManager } from '../Managers/UsersManager'

export class AbstractUserInterface {
	messageHistory = new MessagesHistory()

	/**
	 * @param {EventBus} eventBus
	 * @param {object} deps
	 */
	constructor({ ENV_VARS, eventBus, settingsManager, emotesManager }) {
		if (ENV_VARS === undefined) throw new Error('ENV_VARS is required')
		if (eventBus === undefined) throw new Error('eventBus is required')
		if (emotesManager === undefined) throw new Error('emotesManager is required')
		if (settingsManager === undefined) throw new Error('settingsManager is required')

		this.ENV_VARS = ENV_VARS
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
			const emoteId = emotesManager.getEmoteIdByName(token)
			if (emoteId) {
				const emoteRender = emotesManager.getRenderableEmoteById(emoteId, 'chat-emote')
				tokens[i] = `<div class="nipah__emote-box" data-emote-id="${emoteId}">${emoteRender}</div>`
			}
		}

		return tokens.join(' ')
	}
}
