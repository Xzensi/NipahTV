/**
 * This class is used to track total count of timestamped data entries within a sliding window
 *  where data entries older than (now - timestamp) are removed from the total as new entries are added.
 */
export class SlidingTimestampWindow {
	private timestampWindow: number
	private entries: Array<number>
	private maxEntries: number

	constructor(historyEntries: Array<number>) {
		this.timestampWindow = 14 * 24 * 60 * 60 * 1000 // 2 weeks
		this.entries = historyEntries || []

		// UTF-16 character limit for localStorage (10MB)
		this.maxEntries = 400 // 384 * (string) timestamp * 2 = 9984 bytes

		setInterval(this.update.bind(this), Math.random() * 40 * 1000 + 30 * 60 * 1000)
		setTimeout(this.update.bind(this), (Math.random() * 40 + 30) * 1000)
	}

	addEntry() {
		// Find oldest entry and write to it instead of shifting the array
		if (this.entries.length >= this.maxEntries) {
			let oldestIndex = 0
			let oldestTimestamp = this.entries[0]
			for (let i = 1; i < this.entries.length; i++) {
				if (this.entries[i] < oldestTimestamp) {
					oldestIndex = i
					oldestTimestamp = this.entries[i]
				}
			}
			this.entries[oldestIndex] = Date.now()
			return
		}

		this.entries.push(Date.now())
	}

	update() {
		this.entries = this.entries.filter(entry => entry > Date.now() - this.timestampWindow)
	}

	getTotal() {
		return this.entries.length
	}
}
