import { InputExecutionStrategy, InputIntentDTO } from '../../Strategies/InputExecutionStrategy'

export default class BotrixExecutionStrategy implements InputExecutionStrategy {
	constructor(private rootContext: RootContext, private session: Session) {}

	shouldUseStrategy(inputIntentDTO: InputIntentDTO): boolean {
		return inputIntentDTO.input[0] === '!'
	}

	async route(inputIntentDTO: InputIntentDTO): Promise<void | string> {
		const { networkInterface } = this.session

		if (inputIntentDTO.isReply) {
			if (!inputIntentDTO.replyRefs) throw new Error('ReplyRefs are required for reply messages.')

			await networkInterface.sendReply(
				inputIntentDTO.input,
				inputIntentDTO.replyRefs.messageId,
				inputIntentDTO.replyRefs.messageContent,
				inputIntentDTO.replyRefs.senderId,
				inputIntentDTO.replyRefs.senderUsername,
				true
			)
		} else {
			await networkInterface.sendMessage(inputIntentDTO.input, true)
		}
	}
}
