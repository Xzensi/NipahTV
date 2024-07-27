import { databaseExtended } from '../Database'

export const settingsSchema = '&id'

export interface ISettingDocument {
	id: string
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

	async putRecord(setting: any) {
		return this.db.settings.put(setting)
	}

	async deleteRecord(id: string) {
		return this.db.settings.delete(id)
	}
}
