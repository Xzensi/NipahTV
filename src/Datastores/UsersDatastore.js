export class UsersDatastore {
	users = []
	usersIdMap = new Map()
	usersNameMap = new Map()

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

		const user = { id, name }
		this.usersNameMap.set(name, user)
		this.usersIdMap.set(id, user)
		this.users.push(user)
		this.fuse.add(user)
	}

	searchUsers(searchVal) {
		return this.fuse.search(searchVal)
	}
}
