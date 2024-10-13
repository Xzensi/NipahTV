interface CustomEventListener {
	(evt: any): void
}

export default class DOMEventManager {
	private listeners: Array<{
		element: HTMLElement
		type: string
		listener: CustomEventListener
		options?: AddEventListenerOptions
	}> = []

	addEventListener(
		element: HTMLElement,
		type: string,
		listener: CustomEventListener,
		options?: AddEventListenerOptions
	) {
		element.addEventListener(type, listener, options)
		this.listeners.push({ element, type, listener, options })
	}

	removeAllEventListeners() {
		for (const { element, type, listener, options } of this.listeners) {
			element.removeEventListener(type, listener, options)
		}
		this.listeners = []
	}
}
