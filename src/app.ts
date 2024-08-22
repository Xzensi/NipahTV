// Classes
import { Publisher } from './Classes/Publisher'
import { EmotesManager } from './Managers/EmotesManager'
import { KickUserInterface } from './UserInterface/KickUserInterface'

// Providers
import { KickEmoteProvider } from './Providers/KickEmoteProvider'
import { SevenTVEmoteProvider } from './Providers/SevenTVEmoteProvider'

// Utils
import { PLATFORM_ENUM, PROVIDER_ENUM } from './constants'
import { log, info, error, RESTFromMain, debounce } from './utils'
import { SettingsManager } from './Managers/SettingsManager'
import { AbstractUserInterface } from './UserInterface/AbstractUserInterface'
import { DatabaseProxyFactory, DatabaseProxy } from './Classes/DatabaseProxy'
import { KickNetworkInterface } from './NetworkInterfaces/KickNetworkInterface'
import { TwitchNetworkInterface } from './NetworkInterfaces/TwitchNetworkInterface'
import { UsersManager } from './Managers/UsersManager'
import { KickBadgeProvider } from './Providers/KickBadgeProvider'
import Database from './Database/Database'

// Extensions
import BotrixExtension from './Extensions/Botrix'
import { InputCompletionStrategyRegistry } from './Classes/InputCompletionStrategyRegistry'

class NipahClient {
	VERSION = '1.4.37'

	ENV_VARS = {
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
	rootContext: RootContext | null = null
	settingsManagerPromise: Promise<void> | null = null

	private database: DatabaseProxy | null = null
	private sessions: Session[] = []

	initialize() {
		const { ENV_VARS } = this

		window.NTV_APP_VERSION = this.VERSION

		info(`Initializing Nipah client [${NTV_APP_VERSION}]..`)

		if (__USERSCRIPT__ && __LOCAL__) {
			info('Running in debug mode enabled..')
			NTV_RESOURCE_ROOT = ENV_VARS.LOCAL_RESOURCE_ROOT
			window.NipahTV = this
		} else if (!__USERSCRIPT__) {
			info('Running in extension mode..')
			NTV_RESOURCE_ROOT = browser.runtime.getURL('/')
		} else {
			NTV_RESOURCE_ROOT = ENV_VARS.GITHUB_ROOT + '/' + ENV_VARS.RELEASE_BRANCH + '/'
		}

		Object.freeze(NTV_RESOURCE_ROOT)

		if (window.location.host === 'kick.com') {
			NTV_PLATFORM = PLATFORM_ENUM.KICK
			info('Platform detected: Kick')
		} else if (window.location.host === 'www.twitch.tv') {
			NTV_PLATFORM = PLATFORM_ENUM.TWITCH
			info('Platform detected: Twitch')
		} else {
			return error('Unsupported platform', window.location.host)
		}

		Object.freeze(NTV_PLATFORM)

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
					log('Database passed compatibility check.')
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
		const { database } = this
		if (!database) throw new Error('Database is not initialized.')

		info('Setting up client environment..')

		const eventBus = new Publisher('root')
		const settingsManager = new SettingsManager({ database, eventBus })
		settingsManager.initialize()

		this.settingsManagerPromise = settingsManager.loadSettings().catch(err => {
			throw new Error(`Couldn't load settings because: ${err}`)
		})

		//* The shared context for all sessions
		this.rootContext = {
			eventBus,
			database,
			settingsManager
		}

		this.loadExtensions()
		this.createChannelSession()
	}

	async loadExtensions() {
		// Dynamically load extensions according to enabled extensions
		const rootContext = this.rootContext!
		const { settingsManager } = rootContext

		const isBotrixExtensionEnabled = true //await settingsManager.getSetting('shared.extensions.botrix.enabled')
		if (isBotrixExtensionEnabled) {
			const botrixExtension = new BotrixExtension(rootContext, this.sessions)
			botrixExtension.onEnable()
		}
	}

	async createChannelSession() {
		log(`Creating new session for ${window.location.href}...`)

		const rootContext = this.rootContext
		if (!rootContext) throw new Error('Root context is not initialized.')

		const { database, settingsManager, eventBus: rootEventBus } = rootContext

		const eventBus = new Publisher('session')
		const usersManager = new UsersManager({ eventBus, settingsManager })

		if (NTV_PLATFORM === PLATFORM_ENUM.KICK) {
			this.networkInterface = new KickNetworkInterface()
		} else if (NTV_PLATFORM === PLATFORM_ENUM.TWITCH) {
			// this.networkInterface = new TwitchNetworkInterface()
			throw new Error('Twitch platform is not supported yet.')
		} else {
			throw new Error('Unsupported platform')
		}
		const networkInterface = this.networkInterface

		const session = {
			eventBus,
			networkInterface,
			usersManager,
			inputCompletionStrategyRegistry: new InputCompletionStrategyRegistry()
		} as Session

		this.sessions.push(session)

		if (this.sessions.length > 1) this.cleanupSession(this.sessions[0].channelData.channelName)

		await Promise.allSettled([
			this.settingsManagerPromise,
			networkInterface.loadChannelData().catch(err => {
				throw new Error(`Couldn't load channel data because: ${err}`)
			})
		])

		const channelData = networkInterface.channelData
		if (!channelData) throw new Error('Channel data has not loaded yet.')

		session.channelData = channelData
		// badgeProvider: NTV_PLATFORM === PLATFORM_ENUM.KICK ? new KickBadgeProvider(rootContext, channelData) :
		session.badgeProvider = new KickBadgeProvider(rootContext, channelData)
		session.badgeProvider.initialize()

		const emotesManager = (this.emotesManager = new EmotesManager(rootContext, session))
		emotesManager.initialize()

		session.emotesManager = emotesManager

		let userInterface: KickUserInterface
		if (NTV_PLATFORM === PLATFORM_ENUM.KICK) {
			userInterface = new KickUserInterface(rootContext, session)
		} else {
			return error('Platform has no user interface implemented..', NTV_PLATFORM)
		}

		session.userInterface = userInterface

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

		rootEventBus.publish('ntv.session.create', session)

		if (this.sessions.length > 1) this.cleanupSession(this.sessions[0].channelData.channelName)
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
					url: NTV_RESOURCE_ROOT + 'dist/css/kick.css',
					onerror: () => reject('Failed to load local stylesheet'),
					onload: function (response: any) {
						log('Loaded styles from local resource..')
						GM_addStyle(response.responseText)
						resolve(void 0)
					}
				})
			} else {
				let style
				switch (NTV_PLATFORM) {
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

		const navigateFn = () => {
			if (locationURL === window.location.href) return

			// Kick sometimes navigates to weird KPSDK URLs that we don't want to handle
			if (window.location.pathname.match('^/[a-zA-Z0-9]{8}(?:-[a-zA-Z0-9]{4,12}){4}/.+')) return

			const oldLocation = locationURL
			locationURL = window.location.href
			info('Navigated to:', locationURL)

			this.cleanupSession(oldLocation)
			log('Cleaned up old session for', oldLocation)
			this.createChannelSession()
		}

		if (window.navigation) {
			window.navigation.addEventListener('navigate', debounce(navigateFn, 100))
		} else {
			setInterval(navigateFn, 200)
		}
	}

	cleanupSession(oldLocation: string) {
		const prevSession = this.sessions.shift()
		if (prevSession) {
			log(
				`Cleaning up previous session for channel ${
					prevSession?.channelData?.channelName || '[CHANNEL NOT LOADED]'
				}...`
			)
			prevSession.isDestroyed = true
			prevSession.eventBus.publish('ntv.session.destroy')
			this.rootContext?.eventBus.publish('ntv.session.destroy', prevSession)
		} else {
			log(`No session to clean up for ${oldLocation}..`)
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

	// Firefox add-on compatibility fixes
	if (__FIREFOX_MV2__ || __FIREFOX_MV3__) {
		// https://bugzilla.mozilla.org/show_bug.cgi?id=1208775
		// @ts-ignore https://stackoverflow.com/questions/78761215
		// delete globalThis['EventTarget']
		globalThis['EventTarget'] = window['EventTarget']
	}

	NTV_PLATFORM = PLATFORM_ENUM.NULL
	NTV_RESOURCE_ROOT = ''

	const nipahClient = new NipahClient()
	nipahClient.initialize()
})()
