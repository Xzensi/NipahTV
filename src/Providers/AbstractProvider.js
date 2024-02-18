export class AbstractProvider {
	id = 0

	constructor(datastore) {
		if (this.constructor == AbstractProvider) {
			throw new Error("Class is of abstract type and can't be instantiated")
		}

		if (this.fetchEmotes === undefined) {
			throw new Error('Class is missing required method fetchEmotes')
		}

		if (this.id === undefined) {
			throw new Error('Class is missing required property id')
		}

		this.datastore = datastore
	}

	async fetchEmotes() {
		throw new Error('Not yet implemented')
	}

	getRenderableEmote() {
		throw new Error('Not yet implemented')
	}

	getEmbeddableEmote() {
		throw new Error('Not yet implemented')
	}
}
