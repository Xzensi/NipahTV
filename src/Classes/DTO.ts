export class DTO {
	topic: string
	data: any

	constructor(topic: string, data: any) {
		this.topic = topic
		this.data = data
	}

	setter(key: string, value: any) {
		throw new Error('Data transfer objects are immutable, setter not allowed.')
	}
}
