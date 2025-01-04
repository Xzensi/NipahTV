import FavoriteEmotesModel, { favoriteEmotesSchema, FavoriteEmoteDocument } from './Models/FavoriteEmotesModel'
import EmoteUsagesModel, { emoteUsagesSchema, EmoteUsagesDocument } from './Models/EmoteUsagesModel'
import MutedUsersModel, { MutedUserDocument, mutedUsersSchema } from './Models/MutedUsersModel'
import Dexie, { DexieConstructor, type Table, type EntityTable } from 'dexie'
import { SettingDocument, settingsSchema } from './Models/SettingsModel'
import SettingsModel from './Models/SettingsModel'
import DatabaseAbstract from './DatabaseAbstract'

export type databaseExtended = Dexie & {
	settings: EntityTable<SettingDocument, 'id'>
	emoteUsages: Table<EmoteUsagesDocument, [PlatformId, ChannelId, string]>
	favoriteEmotes: Table<FavoriteEmoteDocument, [PlatformId, ChannelId, string]>
	mutedUsers: Table<MutedUserDocument, [PlatformId, UserId]>
}

export default class Database extends DatabaseAbstract {
	protected idb: databaseExtended
	dbName = 'NipahTV'

	settings: SettingsModel
	emoteUsages: EmoteUsagesModel
	favoriteEmotes: FavoriteEmotesModel
	mutedUsers: MutedUsersModel

	constructor(SWDexie?: DexieConstructor) {
		super()

		this.idb = (SWDexie ? new SWDexie(this.dbName) : new Dexie(this.dbName)) as databaseExtended

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

		this.idb.version(5).upgrade(async tx => {
			// We flip the order indices of favorite emotes because highest order index was first favorite (desc order), now it's last (asc order)
			return tx
				.table('favoriteEmotes')
				.toArray()
				.then(async records => {
					const updates = records.map((record, index) => {
						return tx
							.table('favoriteEmotes')
							.update([record.platformId, record.channelId, record.emoteHid], {
								orderIndex: records.length - index
							})
					})

					return Promise.all(updates)
				})
		})

		this.idb.version(6).stores({
			mutedUsers: mutedUsersSchema
		})

		this.settings = new SettingsModel(this.idb)
		this.emoteUsages = new EmoteUsagesModel(this.idb)
		this.favoriteEmotes = new FavoriteEmotesModel(this.idb)
		this.mutedUsers = new MutedUsersModel(this.idb)
	}
}
