import type { NetworkInterface } from '../NetworkInterfaces/NetworkInterface'
import type InputController from '../Classes/InputController'
import type EmotesManager from './EmotesManager'

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
