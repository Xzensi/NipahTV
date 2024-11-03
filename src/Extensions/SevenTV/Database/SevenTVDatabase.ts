import Dexie, { DexieConstructor, EntityTable, Table } from 'dexie'
import DatabaseAbstract from '@database/DatabaseAbstract'

type databaseExtended = Dexie & {}

export default class SevenTVDatabase extends DatabaseAbstract {
	protected idb: databaseExtended
	dbName = 'NTV_Ext_SevenTV'

	constructor(SWDexie?: DexieConstructor) {
		super()

		this.idb = (SWDexie ? new SWDexie(this.dbName) : new Dexie(this.dbName)) as databaseExtended

		this.idb.version(1).stores({})
	}
}
