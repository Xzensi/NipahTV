const notAllowed = function () {
	throw new Error('PreventDefault cannot be called because the event was set as passive.')
}

const stopPropagation = function (this: Event | any) {
	this._stopPropagation()
	this.stoppedPropagation = true
}

const stopImmediatePropagation = function (this: Event | any) {
	this._stopImmediatePropagation()
	this.stoppedImmediatePropagation = true
}

export class PriorityEventTarget {
	events: Map<string, Array<Array<[(event: Event) => void, AddEventListenerOptions?]>>> = new Map()

	/**
	 * Adds a priority event listener for the specified event type at the specified priority. It will be called in the order of priority.
	 * @param type
	 * @param priority
	 * @param listener
	 * @param options
	 */
	addEventListener(
		type: string,
		priority: number,
		listener: (event: any) => void,
		options?: AddEventListenerOptions
	) {
		if (!this.events.has(type)) {
			this.events.set(type, [])
		}

		const priorities = this.events.get(type)!
		if (!priorities[priority]) priorities[priority] = []

		const listeners = priorities[priority]
		if (options) listeners.push([listener, options])
		else listeners.push([listener])

		if (options && options.signal) {
			options.signal.addEventListener('abort', () => {
				this.removeEventListener(type, priority, listener, options)
			})
		}
	}

	removeEventListener(
		type: string,
		priority: number,
		listener: (event: any) => void,
		options?: EventListenerOptions
	) {
		if (this.events.has(type)) {
			const priorities = this.events.get(type)!
			const listeners = priorities[priority]
			if (!listeners) return

			for (let i = 0; i < listeners.length; i++) {
				let listenerItem = listeners[i][0]
				let optionsItem = listeners[i][1]

				if (listenerItem === listener && optionsItem === options) {
					listeners.splice(i, 1)
					i--
				}
			}
		}
	}

	dispatchEvent(event: Event) {
		// To make stopping event propagation work with other events in list
		//  we extend the event to keep track of its propagation status.
		;(event as any)._stopPropagation = event.stopPropagation
		event.stopPropagation = stopPropagation
		;(event as any)._stopImmediatePropagation = event.stopImmediatePropagation
		event.stopImmediatePropagation = stopImmediatePropagation

		const type = event.type
		if (this.events.has(type)) {
			const priorities = this.events.get(type)!

			// Priorities is a sparse array
			for (const key in priorities) {
				const listeners = priorities[key]

				for (let i = 0; i < listeners.length; i++) {
					const listener = listeners[i][0]
					const options = listeners[i][1]

					if (options) {
						if (options.once) {
							listeners.splice(i, 1)
							i--
						}
						if (options.passive) {
							event.preventDefault = notAllowed
						}
					}

					listener(event)

					if ((event as any).stoppedImmediatePropagation) {
						return
					}
				}

				if ((event as any).stoppedPropagation) {
					return
				}
			}
		}
	}
}
