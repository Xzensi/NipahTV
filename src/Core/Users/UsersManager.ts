import SettingsManager from '../Settings/SettingsManager'
import UsersDatastore from './UsersDatastore'
import Publisher from '../Common/Publisher'
import { Logger } from '@core/Common/Logger'

const logger = new Logger()
const { log, info, error } = logger.destruct()

export default class UsersManager {
	private datastore: UsersDatastore

	constructor(rootContext: RootContext, session: Session) {
		this.datastore = new UsersDatastore(rootContext, session)

		session.eventBus.subscribe(
			'ntv.channel.loaded.channel_data',
			() => {
				this.datastore
					.loadDatabase()
					.then(() => {
						/**
						 * Cleanup database of stale data
						 */
						// TODO: Implement this
					})
					.catch(err => error('CORE', 'USER:MGR', 'Failed to load users data from database.', err.message))
			},
			true,
			true
		)
	}

	hasSeenUser(id: UserId): boolean {
		return this.datastore.hasUser(id)
	}

	hasMutedUser(id: UserId): boolean {
		return this.datastore.hasMutedUser(id)
	}

	registerUser(id: UserId, name: string) {
		this.datastore.registerUser(id, name)
	}

	getUserById(id: UserId) {
		return this.datastore.getUserById(id)
	}

	getUserByName(name: string) {
		return this.datastore.getUserByName(name)
	}

	searchUsers(searchVal: string, limit = 20) {
		return this.datastore.searchUsers(searchVal).slice(0, limit)
	}

	muteUserById(userId: UserId, channelId: ChannelId) {
		this.datastore.muteUserById(userId, channelId)
	}

	unmuteUserById(userId: UserId) {
		this.datastore.unmuteUserById(userId)
	}
}
