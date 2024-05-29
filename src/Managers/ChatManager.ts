import type { AbstractNetworkInterface } from '../NetworkInterfaces/AbstractNetworkInterface'
import type { InputController } from './InputController'
import type { EmotesManager } from './EmotesManager'

export class ChatManager {
	private emotesManager: EmotesManager
	private inputController?: InputController

	constructor({
		networkInterface,
		emotesManager,
		inputController
	}: {
		networkInterface: AbstractNetworkInterface
		emotesManager: EmotesManager
		inputController: InputController
	}) {
		this.emotesManager = emotesManager
	}

	replyMessage(chatEntryId: string, chatEntryUsername: string, chatEntryUserId: string) {}
}
