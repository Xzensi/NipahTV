import { Publisher } from '../Classes/Publisher'
import { error } from '../utils'

export type User = {
	id: string
	name: string
}

export class UsersDatastore {
	usersNameMap = new Map()
	usersIdMap = new Map()
	users: Array<User> = []
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

	eventBus: Publisher

	constructor({ eventBus }: { eventBus: Publisher }) {
		this.eventBus = eventBus

		eventBus.subscribe('ntv.session.destroy', () => {
			// @ts-ignore
			delete this.users // @ts-ignore
			delete this.usersIdMap // @ts-ignore
			delete this.usersNameMap
		})
	}

	hasUser(id: string): boolean {
		return this.usersIdMap.has(id)
	}

	registerUser(id: string, name: string) {
		if (this.usersIdMap.has(id)) return
		if (this.usersCount >= this.maxUsers) {
			error(`UsersDatastore: Max users of ${this.maxUsers} reached. Ignoring new user registration.`)
			return
		}

		const user: User = { id, name }
		this.usersNameMap.set(name, user)
		this.usersIdMap.set(id, user)
		this.users.push(user)
		this.fuse.add(user)
		this.usersCount++
	}

	getUserById(id: string) {
		return this.usersIdMap.get(id)
	}

	searchUsers(searchVal: string) {
		return this.fuse.search(searchVal)
	}
}
