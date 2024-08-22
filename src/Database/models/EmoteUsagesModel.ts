import { databaseExtended } from '../Database'
import { getPlatformSlug } from '../../utils'

export const emoteUsagesSchema = '&[platformId+channelId+emoteHid], platformId, channelId, emoteHid'

export interface IEmoteUsagesDocument {
	platformId: string
	channelId: string
	emoteHid: string
	count: number
}

export default class EmoteUsagesModel {
	private db: databaseExtended

	constructor(db: databaseExtended) {
		this.db = db
	}

	async getRecords(channelId: string) {
		return this.db.emoteUsages.where({ platformId: getPlatformSlug(), channelId }).toArray()
	}

	async updateRecord(platformId: string, channelId: string, emoteHid: string, count: number) {
		return this.db.emoteUsages.where({ platformId, channelId, emoteHid }).modify({ count })
	}

	async deleteRecord(platformId: string, channelId: string, emoteHid: string) {
		return this.db.emoteUsages.delete([platformId, channelId, emoteHid])
	}

	async deleteRecordByHid(platformId: string, emoteHid: string) {
		return this.db.emoteUsages.where({ platformId, emoteHid }).delete()
	}

	async bulkPutRecords(documents: IEmoteUsagesDocument[]) {
		return this.db.emoteUsages.bulkPut(documents)
	}

	async bulkDeleteRecords(records: [TPlatformId, TChannelId, TEmoteHid][]) {
		return this.db.emoteUsages.bulkDelete(records)
	}

	async bulkDeleteRecordsByHid(records: { platformId: string; emoteHid: string }[]) {
		return Promise.all(records.map(record => this.deleteRecordByHid(record.platformId, record.emoteHid)))
	}
}
