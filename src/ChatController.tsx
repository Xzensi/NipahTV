import { CustomEventTarget, TypedCustomEvent } from 'Common/TypedCustomEvent'
import { Message } from 'Components/Message'
import { ulid } from 'utils'

const { log, error } = console

const randomMessagePayloads = [
	'Ayy lmao',
	"Whoa, that's crazy!",
	'Nice!',
	'World ending in 3... 2... 1...',
	'My cat is so cute!',
	'Mustard is the best condiment',
	"What's your favorite color?",
	'Music is life',
	// longer messages
	'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
	'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.',
	'Nullam nec purus nec nunc ultricies tincidunt.',
	'Nam ac nulla nec orci aliquet tincidunt.',
	'Quisque nec odio sit amet metus aliquam sodales.',
	'Etiam eget elit nec sapien ultricies tincidunt.',
	// very long messages
	'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nullam nec purus nec nunc ultricies tincidunt. Nam ac nulla nec orci aliquet tincidunt. Quisque nec odio sit amet metus aliquam sodales. Etiam eget elit nec sapien ultricies tincidunt.',
	'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nullam nec purus nec nunc ultricies tincidunt. Nam ac nulla nec orci aliquet tincidunt. Quisque nec odio sit amet metus aliquam sodales. Etiam eget elit nec sapien ultricies tincidunt. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
	'Nam ac nulla nec orci aliquet tincidunt. Quisque nec odio sit amet metus aliquam sodales. Etiam eget elit nec sapien ultricies tincidunt. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nullam nec purus nec nunce ultricies tincidunt.'
]

function getRandomMessage() {
	return {
		id: ulid(),
		username: 'John Smith',
		content: randomMessagePayloads[Math.floor(Math.random() * randomMessagePayloads.length)]
	}
}

const messagesDataStoreMaxCapacity = 10_000
// const messagesDataStore = Array.from({ length: messagesDataStoreMaxCapacity }, getRandomMessage)

interface ChatControllerEventMap {
	message: Message
}

export default class ChatController {
	eventTarget = new EventTarget() as CustomEventTarget<ChatControllerEventMap>
	messages: Message[] = []
	count: number = 0

	addEventListener<T extends keyof ChatControllerEventMap>(
		type: T,
		listener: (ev: CustomEvent<ChatControllerEventMap[T]>) => any,
		options?: boolean | AddEventListenerOptions
	) {
		this.eventTarget.addEventListener(type, listener, options)
	}

	getChunk(startIndex: number, endIndex: number) {
		if (startIndex < 0) startIndex = 0
		if (endIndex < 0) endIndex = 0
		if (endIndex < startIndex) endIndex = startIndex
		return this.messages.slice(startIndex, endIndex)
	}

	getChunkId(id: string, count: number) {
		if (count < 1) {
			error('Attempted to get a chunk of messages with a count less than 1')
			count = 1
		}

		const index = this.messages.findLastIndex(message => message.id === id)
		if (index === -1) return null

		return this.messages.slice(index, index + count)
	}

	getHeadIndex() {
		return this.messages.length - 1
	}

	getHeadId() {
		return this.messages[this.messages.length - 1]?.id
	}

	getAheadCountById(id: string) {
		const index = this.messages.findLastIndex(message => message.id === id)
		if (index === -1) return 0

		return this.messages.length - index - 1
	}

	simulateMessage() {
		const message = getRandomMessage()
		message.content = `[${++this.count}] ` + message.content
		this.messages.push(message)

		if (this.messages.length > messagesDataStoreMaxCapacity) {
			this.messages.shift()
		}

		this.eventTarget.dispatchEvent(new TypedCustomEvent('message', { detail: message }))
	}
}
