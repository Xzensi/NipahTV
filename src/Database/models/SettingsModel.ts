import { databaseExtended } from '../Database'

export const settingsSchema = '&id, platformId, channelId, key'

export interface SettingDocument {
	id: string
	platformId: 'global' | PlatformId
	channelId: 'shared' | ChannelId
	key: string
	value: string
}

export default class SettingsModel {
	private db: databaseExtended

	constructor(db: databaseExtended) {
		this.db = db
	}

	async getRecords() {
		return this.db.settings.toArray()
	}

	async getRecord(id: string) {
		return this.db.settings.get(id)
	}

	async putRecord(setting: SettingDocument) {
		return this.db.settings.put(setting)
	}

	async deleteRecord(id: string) {
		return this.db.settings.delete(id)
	}
}
