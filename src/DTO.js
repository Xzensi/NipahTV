export class DTO {
	constructor(topic, data) {
		this.topic = topic
		this.data = data
	}

	setter(key, value) {
		throw new Error('Data transfer objects are immutable, setter not allowed.')
	}
}
