import { databaseExtended } from '../Database'

export const mutedUsersSchema = '&[platformId+userId], platformId, userId, userName, channelId, timestamp'

export interface MutedUserDocument {
	platformId: PlatformId
	userId: UserId
	userName: string
	channelId: string
	timestamp: number
}

export default class MutedUsersModel {
	private db: databaseExtended

	constructor(db: databaseExtended) {
		this.db = db
	}

	async getRecords(platformId: PlatformId, channelId?: string) {
		if (channelId) return this.db.mutedUsers.where({ platformId, channelId }).toArray()
		else return this.db.mutedUsers.where({ platformId }).toArray()
	}

	async putRecord(document: { platformId: PlatformId; userId: UserId; userName: string; channelId: string }) {
		return this.db.mutedUsers.put({
			platformId: document.platformId,
			channelId: document.channelId,
			userId: document.userId,
			userName: document.userName,
			timestamp: Date.now()
		})
	}

	async deleteRecord(platformId: PlatformId, userId: UserId) {
		return this.db.mutedUsers.delete([platformId, userId])
	}

	async bulkPutRecords(documents: MutedUserDocument[]) {
		return this.db.mutedUsers.bulkPut(documents)
	}

	async bulkDeleteRecords(records: [PlatformId, UserId][]) {
		return this.db.mutedUsers.bulkDelete(records)
	}
}
