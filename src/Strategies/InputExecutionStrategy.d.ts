interface InputIntentDTOBase {
	readonly input: string
	readonly isReply: boolean
}

interface InputIntentDTOWithReply extends InputIntentDTOBase {
	readonly isReply: true
	readonly replyRefs: {
		messageId: string
		messageContent: string
		senderId: string
		senderUsername: string
	}
}

interface InputIntentDTONoReply extends InputIntentDTOBase {
	readonly isReply: false
}

export type InputIntentDTO = InputIntentDTOWithReply | InputIntentDTONoReply

export interface InputExecutionStrategy {
	shouldUseStrategy(inputIntentDTO: InputIntentDTO): boolean
	route(inputIntentDTO: InputIntentDTO): Promise<string | void>
}
