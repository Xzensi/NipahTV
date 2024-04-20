import type { Database } from './Database'
import { error } from '../utils'

/**
 * For userscripts:
 * scope -> DatabaseProxy -> Database
 *
 * For extensions:
 * scope -> DatabaseProxy --(via sendMessage, received on service worker)--> Database
 */

const DatabaseProxyHandler: ProxyHandler<Database | {}> = {
	get: function (target: Database, prop: keyof Database, receiver: any) {
		// We forward the method call over sendMessage for extensions.
		if (__EXTENSION__) {
			return (...args: any[]) =>
				new Promise((resolve, reject) => {
					browser.runtime
						.sendMessage({ action: 'database', method: prop, args })
						.then(r => (!r || 'error' in r ? reject(r && r.error) : resolve(r.data)))
				})
		}
		// For userscripts, we just call the method directly.
		else if (typeof target[prop] === 'function') {
			return (target[prop] as (...args: any[]) => any).bind(target)
			// } else if (target.hasOwnProperty(prop)) {
			// 	return Reflect.get(target, prop, receiver)
		} else {
			error(`Method "${prop}" not found on database.`)
		}
	}
}

export class DatabaseProxyFactory {
	static create(database?: Database) {
		if (__USERSCRIPT__ && !database) throw new Error('Database instance required for userscripts.')

		return new Proxy(database || {}, DatabaseProxyHandler) as DatabaseProxy
	}
}

// export type DatabaseProxy = ReturnType<typeof DatabaseProxyFactory.create>
export type DatabaseProxy = Database
