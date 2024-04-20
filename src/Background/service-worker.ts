import Dexie from 'dexie'
import { Database } from '../Classes/Database'
import { error, info, log } from '../utils'

info(`Manifest URI: chrome-extension://${chrome.runtime.id}/manifest.json`)

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
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	log('Service worker received message:', request)

	const { action, method, args } = request

	if (action === 'database') {
		if (typeof method !== 'string') {
			error('Invalid database request, method must be a string.', request)
			return sendResponse({ error: 'Invalid database request, method must be a string.' })
		}

		if (typeof database[method as keyof Database] === 'function') {
			if (!database.ready) {
				error('Database not ready.')
				return sendResponse({ error: 'Database not ready.' })
			}

			const func = database[method as keyof Database] as () => Promise<any>
			func.apply(database, args).then((res: any) => {
				log('Database response:', res)
				sendResponse({ data: res })
			})

			return true
		} else {
			error(`Method "${method}" not found on database.`)
			return sendResponse({ error: `Method "${method}" not found on database.` })
		}
	} else {
		error('Invalid action:', request)
		return sendResponse({ error: 'Invalid action.' })
	}
})
