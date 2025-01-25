import { CustomEventTarget, TypedCustomEvent } from 'TypedCustomEvent'
import { Message } from 'Components/Message'

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

	addEventListener<T extends keyof ChatControllerEventMap>(
		type: T,
		listener: (ev: CustomEvent<ChatControllerEventMap[T]>) => any,
		options?: boolean | AddEventListenerOptions
	) {
		this.eventTarget.addEventListener(type, listener, options)
	}

	getChunk(startIndex: number, endIndex: number) {
		return this.messages.slice(startIndex, endIndex)
	}

	getHeadIndex() {
		return this.messages.length - 1
	}

	simulateMessage() {
		const message = getRandomMessage()
		this.messages.push(message)

		if (this.messages.length > messagesDataStoreMaxCapacity) {
			this.messages.shift()
		}

		this.eventTarget.dispatchEvent(new TypedCustomEvent('message', { detail: message }))
	}
}
