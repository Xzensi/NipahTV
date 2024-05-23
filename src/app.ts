// Classes
import { Publisher } from './Classes/Publisher'
import { EmotesManager } from './Managers/EmotesManager'
import { KickUserInterface } from './UserInterface/KickUserInterface'

// Providers
import { KickProvider } from './Providers/KickProvider'
import { SevenTVProvider } from './Providers/SevenTVProvider'

// Utils
import { PLATFORM_ENUM, PROVIDER_ENUM } from './constants'
import { log, info, error } from './utils'
import { SettingsManager } from './Managers/SettingsManager'
import { AbstractUserInterface } from './UserInterface/AbstractUserInterface'
import { Database } from './Classes/Database'
import { DatabaseProxyFactory, DatabaseProxy } from './Classes/DatabaseProxy'
import { KickNetworkInterface } from './NetworkInterfaces/KickNetworkInterface'
import { TwitchNetworkInterface } from './NetworkInterfaces/TwitchNetworkInterface'
import { UsersManager } from './Managers/UsersManager'

class NipahClient {
	ENV_VARS = {
		VERSION: '1.4.3',
		PLATFORM: PLATFORM_ENUM.NULL,
		RESOURCE_ROOT: null as string | null,
		LOCAL_RESOURCE_ROOT: 'http://localhost:3000/',
		// GITHUB_ROOT: 'https://github.com/Xzensi/NipahTV/raw/master',
		// GITHUB_ROOT: 'https://cdn.jsdelivr.net/gh/Xzensi/NipahTV@master',
		GITHUB_ROOT: 'https://raw.githubusercontent.com/Xzensi/NipahTV',
		RELEASE_BRANCH: 'master'
	}

	userInterface: AbstractUserInterface | null = null
	stylesLoaded = !__USERSCRIPT__
	eventBus: Publisher | null = null
	networkInterface: KickNetworkInterface | null = null
	emotesManager: EmotesManager | null = null
	private database: DatabaseProxy | null = null
	private channelData: ChannelData | null = null

	initialize() {
		const { ENV_VARS } = this

		info(`Initializing Nipah client [${ENV_VARS.VERSION}]..`)

		if (__USERSCRIPT__ && __LOCAL__) {
			info('Running in debug mode enabled..')
			ENV_VARS.RESOURCE_ROOT = ENV_VARS.LOCAL_RESOURCE_ROOT
			wwindow.NipahTV = this
		} else if (!__USERSCRIPT__) {
			info('Running in extension mode..')
			ENV_VARS.RESOURCE_ROOT = browser.runtime.getURL('/')
		} else {
			ENV_VARS.RESOURCE_ROOT = ENV_VARS.GITHUB_ROOT + '/' + ENV_VARS.RELEASE_BRANCH + '/'
		}

		if (wwindow.location.host === 'kick.com') {
			ENV_VARS.PLATFORM = PLATFORM_ENUM.KICK
			info('Platform detected: Kick')
		} else if (wwindow.location.host === 'www.twitch.tv') {
			ENV_VARS.PLATFORM = PLATFORM_ENUM.TWITCH
			info('Platform detected: Twitch')
		} else {
			return error('Unsupported platform', wwindow.location.host)
		}

		this.attachPageNavigationListener()
		this.setupDatabase().then(() => {
			this.setupClientEnvironment().catch(err => error('Failed to setup client environment.\n\n', err.message))
		})
	}

	setupDatabase() {
		// TODO Only ask for persistent storage when we low on of space
		// if (navigator.storage && navigator.storage.persist) {
		// 	navigator.storage.persist().then(persistent => {
		// 		if (persistent) {
		// 			info('Storage will not be cleared except by explicit user action')
		// 		} else {
		// 			info('Storage may be cleared by the UA under storage pressure.')
		// 		}
		// 	})
		// }

		return new Promise((resolve, reject) => {
			const database: Database = __USERSCRIPT__
				? DatabaseProxyFactory.create(new Database())
				: DatabaseProxyFactory.create()

			database
				.checkCompatibility()
				.then(() => {
					this.database = database
					resolve(void 0)
				})
				.catch((err: Error) => {
					error('Failed to open database because:', err)
					reject()
				})
		})
	}

	async setupClientEnvironment() {
		const { ENV_VARS, database } = this
		if (!database) throw new Error('Database is not initialized.')

		info('Setting up client environment..')

		const eventBus = new Publisher()
		this.eventBus = eventBus

		if ((ENV_VARS.PLATFORM = PLATFORM_ENUM.KICK)) {
			this.networkInterface = new KickNetworkInterface({ ENV_VARS })
		} else if (ENV_VARS.PLATFORM === PLATFORM_ENUM.TWITCH) {
			// this.networkInterface = new TwitchNetworkInterface()
			throw new Error('Twitch platform is not supported yet.')
		} else {
			throw new Error('Unsupported platform')
		}
		const networkInterface = this.networkInterface

		const settingsManager = new SettingsManager({ database, eventBus })
		settingsManager.initialize()

		const promises = []
		promises.push(
			settingsManager.loadSettings().catch(err => {
				throw new Error(`Couldn't load settings because: ${err}`)
			})
		)
		promises.push(
			networkInterface.loadChannelData().catch(err => {
				throw new Error(`Couldn't load channel data because: ${err}`)
			})
		)
		await Promise.allSettled(promises)

		if (!networkInterface.channelData) throw new Error('Channel data has not loaded yet.')
		const channelData = (this.channelData = networkInterface.channelData)

		const emotesManager = (this.emotesManager = new EmotesManager(
			{ database, eventBus, settingsManager },
			channelData.channel_id
		))
		emotesManager.initialize()

		const usersManager = new UsersManager({ eventBus, settingsManager })

		let userInterface: KickUserInterface
		if (ENV_VARS.PLATFORM === PLATFORM_ENUM.KICK) {
			userInterface = new KickUserInterface({
				ENV_VARS,
				channelData,
				eventBus,
				networkInterface,
				settingsManager,
				emotesManager,
				usersManager
			})
		} else {
			return error('Platform has no user interface implemented..', ENV_VARS.PLATFORM)
		}

		if (!this.stylesLoaded) {
			this.loadStyles()
				.then(() => {
					this.stylesLoaded = true
					userInterface.loadInterface()
				})
				.catch(response => error('Failed to load styles.', response))
		} else {
			userInterface.loadInterface()
		}

		this.userInterface = userInterface

		emotesManager.registerProvider(KickProvider)
		emotesManager.registerProvider(SevenTVProvider)

		const providerLoadOrder = [PROVIDER_ENUM.KICK, PROVIDER_ENUM.SEVENTV]
		emotesManager.loadProviderEmotes(channelData, providerLoadOrder)
	}

	loadStyles() {
		if (__EXTENSION__) return Promise.resolve()

		return new Promise((resolve, reject) => {
			info('Injecting styles..')

			if (__LOCAL__) {
				// * Add permission for GM_xmlhttpRequest to make
				// *  requests to the resource root for development.
				// * @grant GM.xmlHttpRequest
				GM_xmlhttpRequest({
					method: 'GET',
					url: this.ENV_VARS.RESOURCE_ROOT + 'dist/css/kick.css',
					onerror: () => reject('Failed to load local stylesheet'),
					onload: function (response: any) {
						log('Loaded styles from local resource..')
						GM_addStyle(response.responseText)
						resolve(void 0)
					}
				})
			} else {
				let style
				switch (this.ENV_VARS.PLATFORM) {
					case PLATFORM_ENUM.KICK:
						style = 'KICK_CSS'
						break
					default:
						return reject('Unsupported platform')
				}

				const stylesheet = GM_getResourceText(style)
				if (!stylesheet) return reject('Failed to load stylesheet')

				if (stylesheet.substring(0, 4) === 'http') {
					reject('Invalid stylesheet resource.')
				}

				GM_addStyle(stylesheet)
				resolve(void 0)
			}
		})
	}

	attachPageNavigationListener() {
		info('Current URL:', wwindow.location.href)
		let locationURL = wwindow.location.href

		if (wwindow.navigation) {
			wwindow.navigation.addEventListener('navigate', (event: Event) => {
				setTimeout(() => {
					if (locationURL === wwindow.location.href) return
					locationURL = wwindow.location.href

					info('Navigated to:', wwindow.location.href)

					this.cleanupOldClientEnvironment()
					this.setupClientEnvironment()
				}, 100)
			})
		} else {
			setInterval(() => {
				if (locationURL !== wwindow.location.href) {
					locationURL = wwindow.location.href

					info('Navigated to:', locationURL)

					this.cleanupOldClientEnvironment()
					this.setupClientEnvironment()
				}
			}, 100)
		}
	}

	cleanupOldClientEnvironment() {
		log('Cleaning up old session..')

		if (this.eventBus) {
			this.eventBus.publish('ntv.session.destroy')
			this.eventBus.destroy()
			this.eventBus = null
		}
	}
}

;(() => {
	// const __USERSCRIPT__ = typeof unsafeWindow !== 'undefined'
	// const wwindow: CustomWindow = __USERSCRIPT__ ? (unsafeWindow as CustomWindow) : (window as any as CustomWindow)
	// wwindow.__USERSCRIPT__ = __USERSCRIPT__
	const wwindow: CustomWindow = window as any as CustomWindow
	wwindow.wwindow = wwindow

	if (__USERSCRIPT__) {
		info('Running in userscript mode..')
	}

	if (!__USERSCRIPT__) {
		if (!wwindow['browser'] && !globalThis['browser']) {
			if (typeof chrome === 'undefined') {
				return error('Unsupported browser, please use a modern browser to run NipahTV.')
			}
			wwindow.browser = chrome
		}
	}

	var Dexie: any
	if (__USERSCRIPT__ && !Dexie && !(wwindow as any)['Dexie']) {
		return error('Failed to import Dexie')
	}

	if (!Fuse && !wwindow['Fuse']) {
		return error('Failed to import Fuse')
	}

	if (!twemoji && !wwindow['twemoji']) {
		return error('Failed to import Twemoji')
	}

	const nipahClient = new NipahClient()
	nipahClient.initialize()
})()
