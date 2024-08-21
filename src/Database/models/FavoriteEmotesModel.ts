import { databaseExtended } from '../Database'
import { getPlatformSlug, log } from '../../utils'

export const favoriteEmotesSchema = '&[platformId+channelId+emoteHid], platformId, channelId, emoteHid, orderIndex'

export interface IFavoriteEmoteDocument {
	platformId: string
	channelId: string
	emoteHid: string
	orderIndex: number
	emote: Emote
}

export default class FavoriteEmotesModel {
	private db: databaseExtended

	constructor(db: databaseExtended) {
		this.db = db
	}

	async getRecords(channelId?: string) {
		const platformId = getPlatformSlug()
		const query = channelId ? { platformId, channelId } : { platformId }
		return this.db.favoriteEmotes.where(query).toArray()
	}

	async modifyRecordOrderIndex(platformId: string, emoteHid: string, orderIndex: number) {
		return this.db.favoriteEmotes.where({ platformId, emoteHid }).modify({ orderIndex })
	}

	async deleteRecordByHid(platformId: string, emoteHid: string) {
		return this.db.favoriteEmotes.where({ platformId, emoteHid }).delete()
	}

	async bulkPutRecords(documents: IFavoriteEmoteDocument[]) {
		return this.db.favoriteEmotes.bulkPut(documents)
	}

	async bulkOrderRecords(records: { platformId: string; emoteHid: string; orderIndex: number }[]) {
		return Promise.all(
			records.map(record => this.modifyRecordOrderIndex(record.platformId, record.emoteHid, record.orderIndex))
		)
	}

	async bulkDeleteRecords(records: [TPlatformId, TChannelId, TEmoteHid][]) {
		return this.db.favoriteEmotes.bulkDelete(records)
	}

	async bulkDeleteRecordsByHid(records: { platformId: string; emoteHid: string }[]) {
		return Promise.all(records.map(record => this.deleteRecordByHid(record.platformId, record.emoteHid)))
	}
}
