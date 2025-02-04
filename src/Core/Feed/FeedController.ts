import { CustomEventTarget } from '@Core/Common/TypedCustomEvent'

const { log, error } = console

interface Identifiable {
	id: string
}

export interface FeedEventMap<T extends Identifiable> {
	newEntry: T | T[]
}

export interface FeedController<T extends Identifiable> {
	eventTarget: CustomEventTarget<FeedEventMap<T>>
	entries: T[]

	addEventListener<T>(
		type: T,
		listener: (ev: CustomEvent<T>) => any,
		options?: boolean | AddEventListenerOptions
	): void
	getChunk(startIndex: number, endIndex: number): T[] | null
	getChunkId(id: string, count: number): T[] | null
}

export class FeedController<T extends Identifiable> {
	addEventListener<K extends keyof FeedEventMap<T>>(
		type: K,
		listener: (ev: CustomEvent<FeedEventMap<T>[K]>) => any,
		options?: boolean | AddEventListenerOptions
	): void {
		this.eventTarget.addEventListener(type, listener, options)
	}

	getChunk(startIndex: number, endIndex: number) {
		if (startIndex < 0) startIndex = 0
		if (endIndex < 0) endIndex = 0
		if (endIndex < startIndex) endIndex = startIndex
		return this.entries.slice(startIndex, endIndex)
	}

	getChunkId(id: string, count: number) {
		if (count < 1) {
			error('Attempted to get a chunk of entries with a count less than 1')
			count = 1
		}

		const index = this.entries.findLastIndex(entry => entry.id === id)
		if (index === -1) return null

		return this.entries.slice(index, index + count)
	}

	getHeadIndex() {
		return this.entries.length - 1
	}

	getHeadId() {
		return this.entries[this.entries.length - 1]?.id
	}

	getAheadCountById(id: string) {
		const index = this.entries.findLastIndex(entry => entry.id === id)
		if (index === -1) return 0

		return this.entries.length - index - 1
	}
}
