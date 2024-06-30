// Classes
import { Publisher } from './Classes/Publisher'
import { EmotesManager } from './Managers/EmotesManager'
import { KickUserInterface } from './UserInterface/KickUserInterface'

// Providers
import { KickEmoteProvider } from './Providers/KickEmoteProvider'
import { SevenTVEmoteProvider } from './Providers/SevenTVEmoteProvider'

// Utils
import { PLATFORM_ENUM, PROVIDER_ENUM } from './constants'
import { log, info, error, RESTFromMain } from './utils'
import { SettingsManager } from './Managers/SettingsManager'
import { AbstractUserInterface } from './UserInterface/AbstractUserInterface'
import { Database } from './Classes/Database'
import { DatabaseProxyFactory, DatabaseProxy } from './Classes/DatabaseProxy'
import { KickNetworkInterface } from './NetworkInterfaces/KickNetworkInterface'
import { TwitchNetworkInterface } from './NetworkInterfaces/TwitchNetworkInterface'
import { UsersManager } from './Managers/UsersManager'
import { KickBadgeProvider } from './Providers/KickBadgeProvider'

class NipahClient {
	ENV_VARS = {
		VERSION: '1.4.21',
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
	private sessions: Session[] = []

	initialize() {
		const { ENV_VARS } = this

		info(`Initializing Nipah client [${ENV_VARS.VERSION}]..`)

		if (__USERSCRIPT__ && __LOCAL__) {
			info('Running in debug mode enabled..')
			RESOURCE_ROOT = ENV_VARS.LOCAL_RESOURCE_ROOT
			window.NipahTV = this
		} else if (!__USERSCRIPT__) {
			info('Running in extension mode..')
			RESOURCE_ROOT = browser.runtime.getURL('/')
		} else {
			RESOURCE_ROOT = ENV_VARS.GITHUB_ROOT + '/' + ENV_VARS.RELEASE_BRANCH + '/'
		}

		Object.freeze(RESOURCE_ROOT)

		if (window.location.host === 'kick.com') {
			PLATFORM = PLATFORM_ENUM.KICK
			info('Platform detected: Kick')
		} else if (window.location.host === 'www.twitch.tv') {
			PLATFORM = PLATFORM_ENUM.TWITCH
			info('Platform detected: Twitch')
		} else {
			return error('Unsupported platform', window.location.host)
		}

		Object.freeze(PLATFORM)

		this.attachPageNavigationListener()
		this.setupDatabase().then(async () => {
			// Initialize the RESTFromMainService because it needs to
			//  inject page script for Firefox extension.
			window.RESTFromMainService = new RESTFromMain()
			await RESTFromMainService.initialize()

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

		if (PLATFORM === PLATFORM_ENUM.KICK) {
			this.networkInterface = new KickNetworkInterface({ ENV_VARS })
		} else if (PLATFORM === PLATFORM_ENUM.TWITCH) {
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
		const channelData = networkInterface.channelData

		const emotesManager = (this.emotesManager = new EmotesManager(
			{ database, eventBus, settingsManager },
			channelData.channelId
		))
		emotesManager.initialize()

		const usersManager = new UsersManager({ eventBus, settingsManager })

		//* The shared context for all sessions
		const rootContext: RootContext = {
			eventBus,
			networkInterface,
			database,
			emotesManager,
			settingsManager,
			usersManager
		}

		this.createChannelSession(rootContext, channelData)
	}

	createChannelSession(rootContext: RootContext, channelData: ChannelData) {
		const { emotesManager } = rootContext

		const session: Session = {
			channelData,
			// badgeProvider: PLATFORM === PLATFORM_ENUM.KICK ? new KickBadgeProvider(rootContext, session) :
			badgeProvider: new KickBadgeProvider(rootContext, channelData)
		}

		session.badgeProvider.initialize()

		let userInterface: KickUserInterface
		if (PLATFORM === PLATFORM_ENUM.KICK) {
			userInterface = new KickUserInterface(rootContext, session)
		} else {
			return error('Platform has no user interface implemented..', PLATFORM)
		}

		session.userInterface = userInterface
		this.sessions.push(session)

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

		emotesManager.registerProvider(KickEmoteProvider)
		emotesManager.registerProvider(SevenTVEmoteProvider)

		const providerOverrideOrder = [PROVIDER_ENUM.SEVENTV, PROVIDER_ENUM.KICK]
		emotesManager.loadProviderEmotes(channelData, providerOverrideOrder)
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
					url: RESOURCE_ROOT + 'dist/css/kick.css',
					onerror: () => reject('Failed to load local stylesheet'),
					onload: function (response: any) {
						log('Loaded styles from local resource..')
						GM_addStyle(response.responseText)
						resolve(void 0)
					}
				})
			} else {
				let style
				switch (PLATFORM) {
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
		info('Current URL:', window.location.href)
		let locationURL = window.location.href

		if (window.navigation) {
			window.navigation.addEventListener('navigate', (event: Event) => {
				setTimeout(() => {
					if (locationURL === window.location.href) return

					// Kick sometimes navigates to weird KPSDK URLs that we don't want to handle
					if (window.location.pathname.match('^/[a-zA-Z0-9]{8}(?:-[a-zA-Z0-9]{4,12}){4}/.+')) return

					locationURL = window.location.href
					info('Navigated to:', window.location.href)

					this.cleanupOldClientEnvironment()
					this.setupClientEnvironment()
				}, 100)
			})
		} else {
			setInterval(() => {
				if (locationURL === window.location.href) return

				// Kick sometimes navigates to weird KPSDK URLs that we don't want to handle
				if (window.location.pathname.match('^/[a-zA-Z0-9]{8}(?:-[a-zA-Z0-9]{4,12}){4}/.+')) return

				locationURL = window.location.href
				info('Navigated to:', locationURL)

				this.cleanupOldClientEnvironment()
				this.setupClientEnvironment()
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
	// Kick sometimes navigates to weird KPSDK URLs that we don't want to handle
	if (window.location.pathname.match('^/[a-zA-Z0-9]{8}(?:-[a-zA-Z0-9]{4,12}){4}/.+')) {
		log('KPSDK URL detected, bailing out..')
		return
	}

	if (__USERSCRIPT__) {
		info('Running in userscript mode..')
	}

	if (!__USERSCRIPT__) {
		if (!window['browser'] && !globalThis['browser']) {
			if (typeof chrome === 'undefined') {
				return error('Unsupported browser, please use a modern browser to run NipahTV.')
			}
			//@ts-ignore
			window.browser = chrome
		}
	}

	PLATFORM = PLATFORM_ENUM.NULL
	RESOURCE_ROOT = ''

	const nipahClient = new NipahClient()
	nipahClient.initialize()
})()
