import SevenTVDatabase from './Database/SevenTVDatabase'
import { DatabaseProxy } from '@database/DatabaseProxy'
import { SevenTV } from '.'
import { Logger } from '@core/Common/Logger'

const logger = new Logger()
const { log, info, error } = logger.destruct()

export default class SevenTVDatastore {
	private users: Map<SevenTV.ObjectID, SevenTV.User> = new Map()
	private usersByName: Map<string, SevenTV.User> = new Map()
	private entitlements: Map<SevenTV.ObjectID, SevenTV.Entitlement[]> = new Map()
	private hashedEntitlements: Map<string, SevenTV.Entitlement> = new Map()
	private cosmetics: Map<SevenTV.ObjectID, SevenTV.Cosmetic<SevenTV.CosmeticKind>> = new Map()

	constructor(private database: DatabaseProxy<SevenTVDatabase>) {}

	createEntitlement(entitlement: SevenTV.Entitlement) {
		const user = entitlement.user
		if (!user) return error('EXT:STV', 'STORE', 'No user provided for entitlement')

		// TODO we store by display name as well for now, because we can't get sender ID from chat messages in any sane way yet
		if (!this.users.has(user.id)) {
			this.users.set(user.id, user)
			this.usersByName.set(user.display_name, user)
		}

		const entitlements = this.entitlements.get(user.id)
		if (entitlements) entitlements.push(entitlement)
		else this.entitlements.set(user.id, [entitlement])

		this.hashedEntitlements.set(user.id + '_' + entitlement.kind, entitlement)
	}

	deleteEntitlement(entitlement: SevenTV.Entitlement) {
		const user = entitlement.user
		if (!user) return error('EXT:STV', 'STORE', 'No user provided for entitlement')

		const storedEntitlement = this.hashedEntitlements.get(user.id + '_' + entitlement.kind)
		if (storedEntitlement) {
			this.hashedEntitlements.delete(user.id + '_' + entitlement.kind)

			const entitlements = this.entitlements.get(user.id)
			if (entitlements) {
				const index = entitlements.findIndex(e => e.id === entitlement.id)
				if (index !== -1) {
					entitlements.splice(index, 1)
				}
			}
		}
	}

	resetEntitlements(userId: string) {
		this.entitlements.delete(userId)
	}

	createCosmetic<T extends SevenTV.CosmeticKind>(cosmetic: SevenTV.Cosmetic<T>) {
		this.cosmetics.set(cosmetic.id, cosmetic)
	}

	getUserByName(name: string) {
		return this.usersByName.get(name)
	}

	getUserPaint(userId: SevenTV.ObjectID) {
		const entitlement = this.hashedEntitlements.get(userId + '_PAINT')
		return entitlement && (this.cosmetics.get(entitlement.ref_id)?.data as SevenTV.CosmeticPaint)
	}

	getUserBadge(userId: SevenTV.ObjectID) {
		const entitlement = this.hashedEntitlements.get(userId + '_BADGE')
		return entitlement && (this.cosmetics.get(entitlement.ref_id)?.data as SevenTV.CosmeticBadge)
	}
}
