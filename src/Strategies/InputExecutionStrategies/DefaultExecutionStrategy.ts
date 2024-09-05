import { InputIntentDTO, InputExecutionStrategy as InputExecutionStrategy } from '../InputExecutionStrategy'
import type { ContentEditableEditor } from '../../Classes/ContentEditableEditor'

export default class DefaultExecutionStrategy implements InputExecutionStrategy {
	constructor(private rootContext: RootContext, private session: Session) {}

	shouldUseStrategy(inputIntentDTO: InputIntentDTO): boolean {
		return true
	}

	async route(
		contentEditableEditor: ContentEditableEditor,
		inputIntentDTO: InputIntentDTO,
		dontClearInput?: boolean
	): Promise<void | string> {
		const { session } = this
		const { networkInterface } = session

		dontClearInput || contentEditableEditor.clearInput()

		if (inputIntentDTO.isReply) {
			if (!inputIntentDTO.replyRefs) throw new Error('ReplyRefs are required for reply messages.')

			await networkInterface.sendReply(
				inputIntentDTO.input,
				inputIntentDTO.replyRefs.messageId,
				inputIntentDTO.replyRefs.messageContent,
				inputIntentDTO.replyRefs.senderId,
				inputIntentDTO.replyRefs.senderUsername,
				session.channelData.chatroom?.emotesMode?.enabled
			)
		} else {
			await networkInterface.sendMessage(inputIntentDTO.input, session.channelData.chatroom?.emotesMode?.enabled)
		}
	}
}
