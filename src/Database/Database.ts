import FavoriteEmotesModel, { favoriteEmotesSchema, FavoriteEmoteDocument } from './Models/FavoriteEmotesModel'
import EmoteUsagesModel, { emoteUsagesSchema, EmoteUsagesDocument } from './Models/EmoteUsagesModel'
import Dexie, { DexieConstructor, type Table, type EntityTable } from 'dexie'
import { SettingDocument, settingsSchema } from './Models/SettingsModel'
import SettingsModel from './Models/SettingsModel'
import { log, error } from '../Core/Common/utils'

export type databaseExtended = Dexie & {
	settings: EntityTable<SettingDocument, 'id'>
	emoteUsages: Table<EmoteUsagesDocument, [string, string, string]>
	favoriteEmotes: Table<FavoriteEmoteDocument, [string, string, string]>
}

export default class Database {
	protected idb: databaseExtended
	private databaseName = 'NipahTV'
	private ready = false

	settings: SettingsModel
	emoteUsages: EmoteUsagesModel
	favoriteEmotes: FavoriteEmotesModel

	constructor(SWDexie?: DexieConstructor) {
		this.idb = (SWDexie ? new SWDexie(this.databaseName) : new Dexie(this.databaseName)) as any

		this.idb
			.version(2)
			.stores({
				settings: '&id',
				emoteUsage: '&[channelId+emoteHid]',
				emoteHistory: null
			})
			.upgrade(async tx => {
				// Migrate emoteHistory to emoteUsages by counting the timestamps in emoteHistory and storing them in emoteUsages
				// emoteHistory = [{ channelId: '123', emoteHid: '123', timestamps: [1234567890, ...] }, ...]
				// emoteUsages = [{ channelId: '123', emoteHid: '123', count: 1 }, ...]
				const emoteHistoryRecords = await tx.table('emoteHistory').toArray()

				return tx.table('emoteUsages').bulkPut(
					emoteHistoryRecords.map(record => {
						return {
							channelId: record.channelId,
							emoteHid: record.emoteHid,
							count: record.timestamps.length
						}
					})
				)
			})

		this.idb
			.version(3)
			.stores({
				emoteUsage: null,
				emoteUsages: emoteUsagesSchema,
				favoriteEmotes: favoriteEmotesSchema
			})
			.upgrade(async tx => {
				// Migrate index of emoteUsage to include platformId.
				//  At this moment in time, only Kick is supported, so all
				//  records will be updated to have platformId 'kick'.
				return tx
					.table('emoteUsage')
					.toArray()
					.then(async records => {
						return tx.table('emoteUsages').bulkAdd(
							records.map(record => {
								return {
									platformId: 'kick',
									channelId: '' + record.channelId,
									emoteHid: record.emoteHid,
									count: record.count
								}
							})
						)
					})
			})

		this.idb
			.version(4)
			.stores({
				settings: settingsSchema
			})
			.upgrade(tx => {
				return tx
					.table('settings')
					.toCollection()
					.modify(record => {
						record.platformId = 'global'
						record.channelId = 'shared'
						record.key = record.id.replace('shared.', '')
						record.id = `global.shared.${record.key}`
					})
			})

		this.settings = new SettingsModel(this.idb)
		this.emoteUsages = new EmoteUsagesModel(this.idb)
		this.favoriteEmotes = new FavoriteEmotesModel(this.idb)
	}

	async checkCompatibility() {
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

	async getTableCount(tableName: string) {
		return this.idb.table(tableName).count()
	}
}
