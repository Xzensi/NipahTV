import { error, info, log } from '../Core/Common/utils'
import Database from '../Database/Database'
import Dexie from 'dexie'

const TARGET_FIREFOX = 'browser' in self
const TARGET_CHROME = !TARGET_FIREFOX && 'chrome' in self
self['browser'] = self['browser'] || chrome

info(`Manifest URI: ${TARGET_CHROME ? 'chrome' : 'moz'}-extension://${browser.runtime.id}/manifest.json`)

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

browser.runtime.onUpdateAvailable.addListener((details: { version: string }) => {
	info('Update available:', details)

	// Extract the major.minor.patch version from the full version string.
	//  Just in case the version string is in the format "major.minor.patch-build".
	const verArr = (details.version || '1.0.0').split('.')
	if (verArr.length < 3) {
		return error('Invalid version string on update available:', details.version)
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
	log('Service worker received message:', request)

	const { action, stack, args } = request

	if (action === 'database') {
		// Attempt to resolve the request callstack to a method on the database object.
		let resolvedProp: any = database
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
			error(`Invalid database request, unprocessable callstack.`, request)
			return Promise.resolve({ error: `Invalid database request, unprocessable callstack.` })
		}

		if (typeof resolvedProp === 'function') {
			// if (!database.ready) {
			// 	error('Database not ready.')
			// 	return Promise.resolve({ error: 'Database not ready.' })
			// }

			return resolvedProp.apply(prevProp, args).then((res: any) => {
				log('Database response:', res)
				return { data: res }
			})
		} else {
			const method = stack[stack.length - 1]
			error(`Method "${method}" not found on database.`)
			return Promise.resolve({ error: `Method "${method}" not found on database.` })
		}
	} else if (action === 'runtime.reload') {
		info('Reloading extension...')
		browser.runtime.reload()
		log('Reloaded extension.')
		return Promise.resolve({ message: 'Extension reloaded.' })
	} else {
		error('Invalid action:', request)
		return Promise.resolve({ error: 'Invalid action.' })
	}
}
