import Dexie from 'dexie'

export default abstract class DatabaseAbstract {
	protected abstract idb: Dexie
	protected ready = false

	async checkCompatibility() {
		return new Promise((resolve, reject) => {
			if (this.ready) return resolve(void 0)

			this.idb
				.open()
				.then(async () => {
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
