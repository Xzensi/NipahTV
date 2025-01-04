import { databaseExtended } from '../Database'

export const emoteUsagesSchema = '&[platformId+channelId+emoteHid], platformId, channelId, emoteHid'

export interface EmoteUsagesDocument {
	platformId: PlatformId
	channelId: ChannelId
	emoteHid: string
	count: number
}

export default class EmoteUsagesModel {
	private db: databaseExtended

	constructor(db: databaseExtended) {
		this.db = db
	}

	async getRecords(platformId: PlatformId, channelId: ChannelId) {
		return this.db.emoteUsages.where({ platformId, channelId }).toArray()
	}

	async updateRecord(platformId: PlatformId, channelId: ChannelId, emoteHid: string, count: number) {
		return this.db.emoteUsages.where({ platformId, channelId, emoteHid }).modify({ count })
	}

	async deleteRecord(platformId: PlatformId, channelId: ChannelId, emoteHid: string) {
		return this.db.emoteUsages.delete([platformId, channelId, emoteHid])
	}

	async deleteRecordByHid(platformId: PlatformId, emoteHid: string) {
		return this.db.emoteUsages.where({ platformId, emoteHid }).delete()
	}

	async bulkPutRecords(documents: EmoteUsagesDocument[]) {
		return this.db.emoteUsages.bulkPut(documents)
	}

	async bulkDeleteRecords(records: [PlatformId, ChannelId, EmoteHid][]) {
		return this.db.emoteUsages.bulkDelete(records)
	}

	async bulkDeleteRecordsByHid(records: { platformId: PlatformId; emoteHid: string }[]) {
		return Promise.all(records.map(record => this.deleteRecordByHid(record.platformId, record.emoteHid)))
	}
}
