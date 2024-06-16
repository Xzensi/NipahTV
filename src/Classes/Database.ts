import { log, error } from '../utils'

import type { Dexie as _Dexie, DexieConstructor, Table } from 'dexie'
export interface ExtendedDexie extends _Dexie {
	emoteUsage: Table
	settings: Table
}
declare var Dexie: DexieConstructor & ExtendedDexie

export class Database {
	private idb: ExtendedDexie
	private databaseName = 'NipahTV'
	private ready = false

	constructor(SWDexie?: DexieConstructor) {
		this.idb = SWDexie
			? (new SWDexie(this.databaseName) as ExtendedDexie)
			: (new Dexie(this.databaseName) as ExtendedDexie)

		this.idb
			.version(2)
			.stores({
				settings: '&id',
				emoteUsage: '&[channelId+emoteHid]',
				emoteHistory: null
			})
			.upgrade(async tx => {
				// Migrate emoteHistory to emoteUsage by counting the timestamps in emoteHistory and storing them in emoteUsage
				// emoteHistory = [{ channelId: '123', emoteHid: '123', timestamps: [1234567890, ...] }, ...]
				// emoteUsage = [{ channelId: '123', emoteHid: '123', count: 1 }, ...]
				const emoteHistoryRecords = await tx.table('emoteHistory').toArray()

				return tx.table('emoteUsage').bulkPut(
					emoteHistoryRecords.map(record => {
						return {
							channelId: record.channelId,
							emoteHid: record.emoteHid,
							count: record.timestamps.length
						}
					})
				)
			})
	}

	checkCompatibility() {
		return new Promise((resolve, reject) => {
			if (this.ready) return resolve(void 0)

			this.idb
				.open()
				.then(async () => {
					log('Database passed compatibility check.')
					this.ready = true
					resolve(void 0)
				})
				.catch((err: Error) => {
					if (err.name === 'InvalidStateError') {
						reject('Firefox private mode not supported.')
					} else {
						reject(err)
					}
				})
		})
	}

	async getSettings() {
		return this.idb.settings.toArray()
	}

	async getSetting(id: string) {
		return this.idb.settings.get(id)
	}

	async putSetting(setting: any) {
		return this.idb.settings.put(setting)
	}

	async deleteSetting(id: string) {
		return this.idb.settings.delete(id)
	}

	async getTableCount(tableName: string) {
		return this.idb.table(tableName).count()
	}

	async getEmoteUsageRecords(channelId: string) {
		return this.idb.emoteUsage.where('channelId').equals(channelId).toArray()
	}

	async bulkPutEmoteUsage(records: any[]) {
		return this.idb.emoteUsage.bulkPut(records)
	}

	async bulkDeleteEmoteUsage(records: any[]) {
		return this.idb.emoteUsage.bulkDelete(records)
	}
}
