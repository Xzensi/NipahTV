export class MessagesHistory {
	constructor() {
		this.messages = []
		this.cursorIndex = 0
		this.maxMessages = 100
	}

	addMessage(message) {
		this.cursorIndex = 0

		if (message === '') return
		if (this.messages[0] === message) return

		this.messages.unshift(message)
		if (this.messages.length > this.maxMessages) {
			this.messages.pop()
		}
	}

	moveCursorUp() {
		if (this.cursorIndex < this.messages.length - 1) {
			this.cursorIndex++
		}
	}

	moveCursorDown() {
		if (this.cursorIndex > 0) {
			this.cursorIndex--
		}
	}

	getMessage() {
		return this.messages[this.cursorIndex]
	}

	resetCursor() {
		this.cursorIndex = 0
	}
}
