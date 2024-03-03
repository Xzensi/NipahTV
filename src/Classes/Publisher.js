import { log, logEvent, error, assertArgument, assertArgDefined, fetchJSON } from '../utils'
import { DTO } from './DTO'

export class Publisher {
	listeners = new Map()
	firedEvents = new Map()

	subscribe(event, callback, triggerOnExistingEvent = false) {
		assertArgument(event, 'string')
		assertArgument(callback, 'function')

		if (!this.listeners.has(event)) {
			this.listeners.set(event, [])
		}
		this.listeners.get(event).push(callback)

		if (triggerOnExistingEvent && this.firedEvents.has(event)) {
			callback(this.firedEvents.get(event).data)
		}
	}

	publish(topic, data) {
		if (!topic) return error('Invalid event topic, discarding event..')
		const dto = new DTO(topic, data)

		this.firedEvents.set(dto.topic, dto)
		logEvent(dto.topic)

		if (!this.listeners.has(dto.topic)) {
			// log(`No listeners for event ${dto.topic}, discarding event..`)
			return
		}

		const listeners = this.listeners.get(dto.topic)
		for (const listener of listeners) {
			listener(dto.data)
		}
	}

	destroy() {
		this.listeners.clear()
		this.firedEvents.clear()
	}
}
