import { Logger } from '@core/Common/Logger'
import Publisher from '@core/Common/Publisher'
import Fuse from 'fuse.js'

const logger = new Logger()
const { log, info, error } = logger.destruct()

export type User = {
	id: string
	name: string
	muted?: boolean
}

export default class UsersDatastore {
	private usersLowerCaseNameMap: Map<string, User> = new Map()
	private usersIdMap: Map<string, User> = new Map()
	private users: Array<User> = []
	private usersCount = 0
	private mutedUsersMap: Map<UserId, User> = new Map()
	private maxUsers = 50_000

	private fuse = new Fuse<User>([], {
		includeScore: true,
		shouldSort: true,
		includeMatches: true,
		// isCaseSensitive: true,
		findAllMatches: true,
		threshold: 0.4,
		keys: [['name']]
	})

	constructor(private rootContext: RootContext, private session: Session) {
		this.session.eventBus.subscribe('ntv.session.destroy', () => {
			this.users.length = 0
			this.usersIdMap.clear()
			this.usersLowerCaseNameMap.clear()
		})
	}

	async loadDatabase() {
		info('CORE', 'USER:STORE', 'Reading out user data from database..')
		const { database } = this.rootContext
		const { eventBus, channelData } = this.session
		const channelId = channelData.channelId

		database.mutedUsers
			.getRecords(PLATFORM)
			.then(mutedUserRecords => {
				if (mutedUserRecords.length) {
					for (const record of mutedUserRecords) {
						const user = this.registerUser(record.userId, record.userName)
						if (!user) {
							error('CORE', 'USER:STORE', 'Failed to register muted user:', record.userId)
							continue
						}
						user.muted = true
						this.mutedUsersMap.set(record.userId, user)
					}

					log(
						'CORE',
						'USER:STORE',
						`Loaded ${mutedUserRecords.length} muted users from database.`,
						this.mutedUsersMap
					)
				}
			})
			.then(() => eventBus.publish('ntv.datastore.users.muted.loaded'))
			.catch(err => error('Failed to load muted users data from database.', err.message))
	}

	hasUser(id: string): boolean {
		return this.usersIdMap.has(id)
	}

	hasMutedUser(id: string): boolean {
		const user = this.usersIdMap.get(id)
		if (!user) return false

		return user.muted ?? false
	}

	registerUser(id: string, name: string) {
		typeof id === 'string' || error('CORE', 'USER:STORE', 'Invalid user id:', id)

		if (this.usersIdMap.has(id)) return
		if (this.usersCount >= this.maxUsers) {
			error(
				'CORE',
				'USER:STORE',
				`UsersDatastore: Max users of ${this.maxUsers} reached. Ignoring new user registration.`
			)
			return
		}

		const user: User = { id: id, name }
		this.usersLowerCaseNameMap.set(name.toLowerCase(), user)
		this.usersIdMap.set(id, user)
		this.users.push(user)
		this.fuse.add(user)
		this.usersCount++

		return user
	}

	getUserById(id: string) {
		return this.usersIdMap.get(id + '')
	}

	getUserByName(name: string) {
		return this.usersLowerCaseNameMap.get(name.toLowerCase())
	}

	searchUsers(searchVal: string) {
		return this.fuse.search(searchVal)
	}

	muteUserById(userId: UserId, channelId: ChannelId) {
		const user = this.usersIdMap.get(userId + '')
		if (!user) return

		const { database } = this.rootContext
		database.mutedUsers.putRecord({
			platformId: PLATFORM,
			channelId: channelId,
			userId: user.id,
			userName: user.name
		})

		user.muted = true

		this.session.eventBus.publish('ntv.user.muted', user)
	}

	unmuteUserById(userId: UserId) {
		const user = this.usersIdMap.get(userId + '')
		if (!user) return

		const { database } = this.rootContext
		database.mutedUsers.deleteRecord(PLATFORM, userId)

		user.muted = false

		this.session.eventBus.publish('ntv.user.unmuted', user)
	}
}
