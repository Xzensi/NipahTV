import { error } from '../utils'

export class UsersDatastore {
	users = []
	usersIdMap = new Map()
	usersNameMap = new Map()
	usersCount = 0

	maxUsers = 50_000

	fuse = new Fuse([], {
		includeScore: true,
		shouldSort: true,
		includeMatches: true,
		// isCaseSensitive: true,
		findAllMatches: true,
		threshold: 0.4,
		keys: [['name']]
	})

	constructor({ eventBus }) {
		this.eventBus = eventBus

		eventBus.subscribe('nipah.session.destroy', () => {
			delete this.users
			delete this.usersIdMap
			delete this.usersNameMap
		})
	}

	registerUser(id, name) {
		if (this.usersIdMap.has(id)) return
		if (this.usersCount >= this.maxUsers) {
			error(`UsersDatastore: Max users of ${this.maxUsers} reached. Ignoring new user registration.`)
			return
		}

		const user = { id, name }
		this.usersNameMap.set(name, user)
		this.usersIdMap.set(id, user)
		this.users.push(user)
		this.fuse.add(user)
		this.usersCount++
	}

	searchUsers(searchVal) {
		return this.fuse.search(searchVal)
	}
}
