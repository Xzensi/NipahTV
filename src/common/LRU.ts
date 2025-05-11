export class LRU<K, V> {
	private cache = new Map()

	constructor(private max = 50) {}

	/**
	 * Get value from cache
	 * @param key The key to get the value for
	 * @returns The value for the key, or undefined if not found
	 */
	get(key: K) {
		let item = this.cache.get(key)
		if (item !== undefined) {
			// refresh key
			this.cache.delete(key)
			this.cache.set(key, item)
		}
		return item
	}

	/**
	 * Set a value in the cache
	 * @param key The key to set the value for
	 * @param val The value to set
	 */
	set(key: K, val: V) {
		// refresh key
		if (this.cache.has(key)) this.cache.delete(key)
		// evict oldest
		else if (this.cache.size === this.max) this.cache.delete(this.cache.keys().next().value)
		this.cache.set(key, val)
	}

	/**
	 * Set the maximum number of items to store in the cache
	 * @param max The maximum number of items to store in the cache
	 */
	setMax(max: number) {
		this.max = max
	}
}
