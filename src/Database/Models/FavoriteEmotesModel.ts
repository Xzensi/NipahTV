import { databaseExtended } from '../Database'

export const favoriteEmotesSchema = '&[platformId+channelId+emoteHid], platformId, channelId, emoteHid, orderIndex'

export interface FavoriteEmoteDocument {
	platformId: PlatformId
	channelId: ChannelId
	emoteHid: string
	orderIndex: number
	emote: Emote
}

export default class FavoriteEmotesModel {
	private db: databaseExtended

	constructor(db: databaseExtended) {
		this.db = db
	}

	async getRecords(platformId: PlatformId, channelId?: ChannelId) {
		const query = channelId ? { platformId, channelId } : { platformId }
		return this.db.favoriteEmotes.where(query).toArray()
	}

	async modifyRecordOrderIndex(platformId: PlatformId, emoteHid: string, orderIndex: number) {
		return this.db.favoriteEmotes.where({ platformId, emoteHid }).modify({ orderIndex })
	}

	async deleteRecordByHid(platformId: PlatformId, emoteHid: string) {
		return this.db.favoriteEmotes.where({ platformId, emoteHid }).delete()
	}

	async bulkPutRecords(documents: FavoriteEmoteDocument[]) {
		return this.db.favoriteEmotes.bulkPut(documents)
	}

	async bulkOrderRecords(records: { platformId: PlatformId; emoteHid: string; orderIndex: number }[]) {
		return Promise.all(
			records.map(record => this.modifyRecordOrderIndex(record.platformId, record.emoteHid, record.orderIndex))
		)
	}

	async bulkDeleteRecords(records: [PlatformId, ChannelId, EmoteHid][]) {
		return this.db.favoriteEmotes.bulkDelete(records)
	}

	async bulkDeleteRecordsByHid(records: { platformId: PlatformId; emoteHid: string }[]) {
		return Promise.all(records.map(record => this.deleteRecordByHid(record.platformId, record.emoteHid)))
	}
}
