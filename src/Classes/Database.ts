import { log, error } from '../utils'

import type { Dexie as _Dexie, DexieConstructor, Table } from 'dexie'
export interface ExtendedDexie extends _Dexie {
	emoteHistory: Table
	settings: Table
}
declare var Dexie: DexieConstructor & ExtendedDexie

export class Database {
	handle: ExtendedDexie

	constructor({ ENV_VARS }: { ENV_VARS: any }) {
		this.handle = new Dexie(ENV_VARS.DATABASE_NAME) as ExtendedDexie
		this.handle.version(1).stores({
			settings: '&id',
			emoteHistory: '&[channelId+emoteHid]'
		})
	}

	checkCompatibility() {
		return new Promise((resolve, reject) => {
			this.handle
				.open()
				.then(() => {
					log('Database passed compatibility check.')
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
}
