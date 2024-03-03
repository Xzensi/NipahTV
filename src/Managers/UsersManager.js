import { UsersDatastore } from '../Datastores/UsersDatastore'

export class UsersManager {
	constructor({ eventBus, settingsManager }) {
		this.datastore = new UsersDatastore({ eventBus })
	}

	registerUser(id, name) {
		this.datastore.registerUser(id, name)
	}

	searchUsers(searchVal, limit = 20) {
		return this.datastore.searchUsers(searchVal).slice(0, limit)
	}
}
