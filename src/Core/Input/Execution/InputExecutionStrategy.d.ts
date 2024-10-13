import type { ContentEditableEditor } from '../ContentEditableEditor'

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
	route(
		contentEditableEditor: ContentEditableEditor,
		inputIntentDTO: InputIntentDTO,
		dontClearInput?: boolean
	): Promise<string | void>
}
