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

	async bulkPutRecords(documents: any[]) {
		return this.db.emoteUsages.bulkPut(documents)
	}

	async bulkDeleteRecords(records: any[]) {
		return this.db.emoteUsages.bulkDelete(records)
	}
}
