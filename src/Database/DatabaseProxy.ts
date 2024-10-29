import DatabaseAbstract from './DatabaseAbstract'

/**
 * For userscripts:
 * scope -> DatabaseProxy -> Database
 *
 * For extensions:
 * scope -> DatabaseProxy --(via sendMessage, received on service worker)--> Database
 */

// export type DatabaseProxy = ReturnType<typeof DatabaseProxyFactory.create>
export type DatabaseProxy<T extends DatabaseAbstract> = T

interface DatabaseMessage {
	action: string
	db: string
	stack: string[]
	args?: any[]
}

const extensionProxyHandler: ProxyHandler<{}> = {
	/**
	 * [dbName] gets passed as the first argument to the Proxy constructor
	 *   to initialize the database name, then stack is tacked on as
	 *   empty array to keep track of the callstack.
	 */
	get(target: { (): any; db: string; stack: string[] }, prop: string, receiver: ProxyConstructor) {
		if (target.prototype === undefined) {
			// @ts-ignore
			const db = target[0]
			// @ts-ignore
			target = function () {}
			target.stack = [prop]
			target.db = db
		} else {
			target.stack.push(prop)
		}

		return new Proxy(target, extensionProxyHandler)
	},

	apply(target: { (): any; db: string; stack: string[] }, thisArg: any, args: any[]) {
		return new Promise((resolve, reject) => {
			browser.runtime
				.sendMessage(<DatabaseMessage>{
					action: 'database',
					db: target.db,
					stack: target.stack,
					args
				})
				.then(r => {
					!r || 'error' in r ? reject(r && r.error) : resolve(r.data)
				})
		})
	}
}

export class DatabaseProxyFactory {
	static create<T extends DatabaseAbstract>(dbName: string, database?: T): DatabaseProxy<T> {
		if (database) return database
		else return new Proxy([dbName], extensionProxyHandler) as DatabaseProxy<T>
	}
}
