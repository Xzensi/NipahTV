import { Database, ExtendedDexie } from './Database'

export class DatabaseInterface {
	db?: Database
	handle?: ExtendedDexie

	constructor(database?: Database) {
		if (database) {
			this.db = database
			this.handle = database.handle
		}
	}

	async getSettings() {
		if (this.handle) {
			return await this.handle.settings.toArray()
		}
		return []
	}

	async putSetting(setting: any) {
		if (this.handle) {
			return await this.handle.settings.put(setting)
		}
	}

	async getHistoryRecords(plaform: number, channelId: string) {
		if (this.handle) {
			return await this.handle.emoteHistory.where('channelId').equals(channelId).toArray()
		}
		return []
	}

	async bulkPutEmoteHistory(records: any[]) {
		if (this.handle) {
			return await this.handle.emoteHistory.bulkPut(records)
		}
	}

	async bulkDeleteEmoteHistory(records: any[]) {
		if (this.handle) {
			return await this.handle.emoteHistory.bulkDelete(records)
		}
	}
}
