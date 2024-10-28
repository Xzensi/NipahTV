import Dexie, { DexieConstructor, EntityTable, Table } from 'dexie'
import DatabaseAbstract from '@database/DatabaseAbstract'

type databaseExtended = Dexie & {
	// settings: EntityTable<SettingDocument, 'id'>
	// emoteUsages: Table<EmoteUsagesDocument, [string, string, string]>
	// favoriteEmotes: Table<FavoriteEmoteDocument, [string, string, string]>
}

export default class SevenTVDatabase extends DatabaseAbstract {
	protected idb: databaseExtended
	dbName = 'NTV_Ext_SevenTV'

	// settings: SettingsModel
	// emoteUsages: EmoteUsagesModel
	// favoriteEmotes: FavoriteEmotesModel

	constructor(SWDexie?: DexieConstructor) {
		super()

		this.idb = (SWDexie ? new SWDexie(this.dbName) : new Dexie(this.dbName)) as databaseExtended

		this.idb.version(1).stores({
			settings: '&id',
			emoteUsage: '&[channelId+emoteHid]'
		})

		// this.settings = new SettingsModel(this.idb)
		// this.emoteUsages = new EmoteUsagesModel(this.idb)
		// this.favoriteEmotes = new FavoriteEmotesModel(this.idb)
	}
}
