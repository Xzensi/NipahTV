import { log, error } from '../utils'

import type { Dexie as _Dexie, DexieConstructor, Table } from 'dexie'
export interface ExtendedDexie extends _Dexie {
	emoteHistory: Table
	settings: Table
}
declare var Dexie: DexieConstructor & ExtendedDexie

export class Database {
	idb: ExtendedDexie
	databaseName = 'NipahTV'
	ready = false

	constructor(SWDexie?: DexieConstructor) {
		this.idb = SWDexie
			? (new SWDexie(this.databaseName) as ExtendedDexie)
			: (new Dexie(this.databaseName) as ExtendedDexie)

		this.idb.version(1).stores({
			settings: '&id',
			emoteHistory: '&[channelId+emoteHid]'
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
		return await this.idb.settings.toArray()
	}

	async putSetting(setting: any) {
		return await this.idb.settings.put(setting)
	}

	async getHistoryRecords(plaform: number, channelId: string) {
		return await this.idb.emoteHistory.where('channelId').equals(channelId).toArray()
	}

	async bulkPutEmoteHistory(records: any[]) {
		return await this.idb.emoteHistory.bulkPut(records)
	}

	async bulkDeleteEmoteHistory(records: any[]) {
		return await this.idb.emoteHistory.bulkDelete(records)
	}
}
