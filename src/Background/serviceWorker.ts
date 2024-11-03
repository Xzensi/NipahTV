import SevenTVExtension from '@extensions/SevenTV'
import { Logger } from '@core/Common/Logger'
import Database from '@database/Database'
import Dexie from 'dexie'

const logger = new Logger()
const { log, info, error } = logger.destruct()

const TARGET_FIREFOX = 'browser' in self
const TARGET_CHROME = !TARGET_FIREFOX && 'chrome' in self
self['browser'] = self['browser'] || chrome

info(
	'WORKER',
	'INIT',
	`Manifest URI: ${TARGET_CHROME ? 'chrome' : 'moz'}-extension://${browser.runtime.id}/manifest.json`
)

const database = new Database(Dexie)
database
	.checkCompatibility()
	// .then(() => {
	// 	// browser.runtime.getManifest().version
	// 	database.settings.putRecord({
	// 		id: 'global.shared.app.update_available',
	// 		platformId: 'global',
	// 		channelId: 'shared',
	// 		key: 'app.update_available',
	// 		value: '9.9.9'
	// 		// value: '1.2.0'
	// 	})
	// })
	.catch((err: any) => {
		error('WORKER', 'INIT', 'Database compatibility check failed.', err)
	})

const databases = new Map()
databases.set(database.dbName, database)

// Create databases for enabled extensions.
// const extensions = ExtensionManager.getEnabledExtensions()
const sevenTVDatabase = SevenTVExtension.getExtensionDatabase()
databases.set(sevenTVDatabase.dbName, sevenTVDatabase)

log('WORKER', 'INIT', 'Service worker loaded.')

self.addEventListener('install', event => {
	log('WORKER', 'INIT', 'Service worker installed.')
})

self.addEventListener('activate', event => {
	log('WORKER', 'INIT', 'Service worker activated.')
	// event.waitUntil()
})

browser.runtime.onUpdateAvailable.addListener((details: { version: string }) => {
	info('WORKER', 'MAIN', 'Update available:', details)

	// Extract the major.minor.patch version from the full version string.
	//  Just in case the version string is in the format "major.minor.patch-build".
	const verArr = (details.version || '1.0.0').split('.')
	if (verArr.length < 3) {
		return error('WORKER', 'MAIN', 'Invalid version string on update available:', details.version)
	}

	const newVersion = `${verArr[0]}.${verArr[1]}.${verArr[2]}`

	// Set the update available flag in the database.
	database.settings.putRecord({
		id: 'global.shared.app.update_available',
		platformId: 'global',
		channelId: 'shared',
		key: 'app.update_available',
		value: newVersion
	})
})

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (TARGET_CHROME) {
		// https://issues.chromium.org/issues/40753031
		// https://issues.chromium.org/issues/40633657
		handleMessage(request).then((res: any) => {
			sendResponse(res)
		})
		return true
	} else {
		return handleMessage(request)
	}
})

function handleMessage(request: any) {
	log('WORKER', 'MAIN', 'Service worker received message:', request)

	const { action, stack, args } = request

	if (action === 'database') {
		const dbName = request.db
		const db = databases.get(dbName)
		if (!db) {
			error('WORKER', 'MAIN', 'Database not found for request:', request)
			return Promise.resolve({ error: 'Database not found.' })
		}

		// Attempt to resolve the request callstack to a method on the database object.
		let resolvedProp: any = db
		let prevProp = resolvedProp
		for (const prop of stack) {
			if (resolvedProp['' + prop] === undefined) {
				resolvedProp = null
				break
			}

			prevProp = resolvedProp
			resolvedProp = resolvedProp[prop]
		}

		if (resolvedProp === null) {
			error('WORKER', 'MAIN', `Invalid database request, unprocessable callstack.`, request)
			return Promise.resolve({ error: `Invalid database request, unprocessable callstack.` })
		}

		if (!db.ready && stack[0] !== 'checkCompatibility') {
			error('WORKER', 'MAIN', 'Database not ready for request:', request)
			return Promise.resolve({ error: 'Database not ready.' })
		}

		if (typeof resolvedProp === 'function') {
			return resolvedProp.apply(prevProp, args).then((res: any) => {
				log('WORKER', 'MAIN', 'Database response:', res)
				return { data: res }
			})
		} else {
			const method = stack[stack.length - 1]
			error('WORKER', 'MAIN', `Method "${method}" not found on database.`)
			return Promise.resolve({ error: `Method "${method}" not found on database.` })
		}
	} else if (action === 'runtime.reload') {
		info('WORKER', 'MAIN', 'Reloading extension...')
		browser.runtime.reload()
		log('WORKER', 'MAIN', 'Reloaded extension.')
		return Promise.resolve({ message: 'Extension reloaded.' })
	} else {
		error('WORKER', 'MAIN', 'Invalid action:', request)
		return Promise.resolve({ error: 'Invalid action.' })
	}
}
