import Dexie, { DexieConstructor, EntityTable, Table } from 'dexie'
import DatabaseAbstract from '@database/DatabaseAbstract'

type databaseExtended = Dexie & {}

export default class BetterTTVDatabase extends DatabaseAbstract {
	protected idb: databaseExtended
	dbName = 'NTV_Ext_BetterTTV'

	constructor(SWDexie?: DexieConstructor) {
		super()

		this.idb = (SWDexie ? new SWDexie(this.dbName) : new Dexie(this.dbName)) as databaseExtended

		this.idb.version(1).stores({})
	}
}
