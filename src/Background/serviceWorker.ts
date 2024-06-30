import { Database } from '../Classes/Database'
import { error, info, log } from '../utils'
import Dexie from 'dexie'

const TARGET_FIREFOX = 'browser' in self
const TARGET_CHROME = !TARGET_FIREFOX && 'chrome' in self
self['browser'] = self['browser'] || chrome

info(`Manifest URI: ${TARGET_CHROME ? 'chrome' : 'moz'}-extension://${browser.runtime.id}/manifest.json`)

const database = new Database(Dexie)
database.checkCompatibility().catch((err: any) => {
	error('Database compatibility check failed.', err)
})

log('Service worker loaded.')

self.addEventListener('install', event => {
	log('Service worker installed.')
})

self.addEventListener('activate', event => {
	log('Service worker activated.')
	// event.waitUntil()
})

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (TARGET_CHROME) {
		// https://issues.chromium.org/issues/40753031
		// https://issues.chromium.org/issues/40633657
		handleMessage(request).then(res => {
			sendResponse(res)
		})
		return true
	} else {
		return handleMessage(request)
	}
})

function handleMessage(request: any) {
	log('Service worker received message:', request)

	const { action, method, args } = request

	if (action === 'database') {
		if (typeof method !== 'string') {
			error('Invalid database request, method must be a string.', request)
			return Promise.resolve({ error: 'Invalid database request, method must be a string.' })
		}

		if (typeof database[method as keyof Database] === 'function') {
			// if (!database.ready) {
			// 	error('Database not ready.')
			// 	return Promise.resolve({ error: 'Database not ready.' })
			// }

			const func = database[method as keyof Database] as () => Promise<any>
			return func.apply(database, args).then((res: any) => {
				log('Database response:', res)
				return { data: res }
			})
		} else {
			error(`Method "${method}" not found on database.`)
			return Promise.resolve({ error: `Method "${method}" not found on database.` })
		}
	} else {
		error('Invalid action:', request)
		return Promise.resolve({ error: 'Invalid action.' })
	}
}
