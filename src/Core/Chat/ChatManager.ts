import type { NetworkInterface } from '../Common/NetworkInterface'
import type InputController from '../Input/InputController'
import type EmotesManager from '../Emotes/EmotesManager'

export class ChatManager {
	private emotesManager: EmotesManager
	private inputController?: InputController

	constructor({
		networkInterface,
		emotesManager,
		inputController
	}: {
		networkInterface: NetworkInterface
		emotesManager: EmotesManager
		inputController: InputController
	}) {
		this.emotesManager = emotesManager
	}

	replyMessage(chatEntryId: string, chatEntryUsername: string, chatEntryUserId: string) {}
}
