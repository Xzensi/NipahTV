import UsersDatastore from '../Datastores/UsersDatastore'
import SettingsManager from './SettingsManager'
import Publisher from '../Classes/Publisher'

export default class UsersManager {
	private datastore: UsersDatastore

	constructor({ eventBus, settingsManager }: { eventBus: Publisher; settingsManager: SettingsManager }) {
		this.datastore = new UsersDatastore({ eventBus })
	}

	hasSeenUser(id: string): boolean {
		return this.datastore.hasUser(id)
	}

	hasMutedUser(id: string): boolean {
		return this.datastore.hasMutedUser(id)
	}

	registerUser(id: string, name: string) {
		this.datastore.registerUser(id, name)
	}

	getUserById(id: string) {
		return this.datastore.getUserById(id)
	}

	getUserByName(name: string) {
		return this.datastore.getUserByName(name)
	}

	searchUsers(searchVal: string, limit = 20) {
		return this.datastore.searchUsers(searchVal).slice(0, limit)
	}

	muteUserById(id: string) {
		this.datastore.muteUserById(id)
	}

	unmuteUserById(id: string) {
		this.datastore.unmuteUserById(id)
	}
}
