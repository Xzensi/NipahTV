import { Publisher } from '../Classes/Publisher'
import { error, log } from '../utils'
import Fuse from 'fuse.js'

export type User = {
	id: string
	name: string
	muted?: boolean
}

export class UsersDatastore {
	private eventBus: Publisher

	private usersLowerCaseNameMap: Map<string, User> = new Map()
	private usersIdMap: Map<string, User> = new Map()
	private users: Array<User> = []
	private usersCount = 0
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

	constructor({ eventBus }: { eventBus: Publisher }) {
		this.eventBus = eventBus

		eventBus.subscribe('ntv.session.destroy', () => {
			this.users.length = 0
			this.usersIdMap.clear()
			this.usersLowerCaseNameMap.clear()
		})
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
		typeof id === 'string' || error('Invalid user id:', id)

		if (this.usersIdMap.has(id)) return
		if (this.usersCount >= this.maxUsers) {
			error(`UsersDatastore: Max users of ${this.maxUsers} reached. Ignoring new user registration.`)
			return
		}

		const user: User = { id: id, name }
		this.usersLowerCaseNameMap.set(name.toLowerCase(), user)
		this.usersIdMap.set(id, user)
		this.users.push(user)
		this.fuse.add(user)
		this.usersCount++
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

	muteUserById(id: string) {
		const user = this.usersIdMap.get(id + '')
		if (!user) return

		user.muted = true

		this.eventBus.publish('ntv.user.muted', user)
	}

	unmuteUserById(id: string) {
		const user = this.usersIdMap.get(id + '')
		if (!user) return

		user.muted = false

		this.eventBus.publish('ntv.user.unmuted', user)
	}
}
