import type Database from '../Database/Database'

/**
 * For userscripts:
 * scope -> DatabaseProxy -> Database
 *
 * For extensions:
 * scope -> DatabaseProxy --(via sendMessage, received on service worker)--> Database
 */

// export type DatabaseProxy = ReturnType<typeof DatabaseProxyFactory.create>
export type DatabaseProxy = Database

interface DatabaseMessage {
	action: string
	stack: string[]
	args?: any[]
}

const extensionProxyHandler: ProxyHandler<{}> = {
	get(target: [] | { (): any; stack: string[] }, prop: string, receiver: ProxyConstructor) {
		// @ts-ignore
		if (target.prototype === undefined) {
			// @ts-ignore
			target = function () {}
			// @ts-ignore
			target.stack = [prop]
		} else {
			// @ts-ignore
			target.stack.push(prop)
		}

		return new Proxy(target, extensionProxyHandler)
	},

	apply(target: { (): any; stack: string[] }, thisArg: any, args: any[]) {
		return new Promise((resolve, reject) => {
			browser.runtime
				.sendMessage(<DatabaseMessage>{
					action: 'database',
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
	static create(database?: Database): DatabaseProxy {
		if (__USERSCRIPT__) {
			if (!database) throw new Error('Database instance required for userscripts.')
			return database
		}

		if (__EXTENSION__) {
			return new Proxy([], extensionProxyHandler) as DatabaseProxy
		} else {
			throw new Error('Unable to create database handle for unknown environment.')
		}
	}
}
