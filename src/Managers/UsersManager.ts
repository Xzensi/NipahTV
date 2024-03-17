import { UsersDatastore } from '../Datastores/UsersDatastore'
import { SettingsManager } from './SettingsManager'
import { Publisher } from '../Classes/Publisher'

export class UsersManager {
	datastore: UsersDatastore

	constructor({ eventBus, settingsManager }: { eventBus: Publisher; settingsManager: SettingsManager }) {
		this.datastore = new UsersDatastore({ eventBus })
	}

	hasSeenUser(name: string): boolean {
		return this.datastore.hasUser(name)
	}

	registerUser(id: string, name: string) {
		this.datastore.registerUser(id, name)
	}

	searchUsers(searchVal: string, limit = 20) {
		return this.datastore.searchUsers(searchVal).slice(0, limit)
	}
}
