// Classes
import { KickUserInterface } from './UserInterface/KickUserInterface'
import EmotesManager from './Managers/EmotesManager'
import Publisher from './Classes/Publisher'

// Providers
import SevenTVEmoteProvider from './Providers/SevenTVEmoteProvider'
import KickEmoteProvider from './Providers/KickEmoteProvider'

// Utils
import TwitchNetworkInterface from './NetworkInterfaces/TwitchNetworkInterface'
import KickNetworkInterface from './NetworkInterfaces/KickNetworkInterface'
import { DatabaseProxyFactory, DatabaseProxy } from './Classes/DatabaseProxy'
import { log, info, error, RESTFromMain, debounce, getPlatformId } from './utils'
import KickBadgeProvider from './Providers/KickBadgeProvider'
import { PLATFORM_ENUM, PROVIDER_ENUM } from './constants'
import SettingsManager from './Managers/SettingsManager'
import UsersManager from './Managers/UsersManager'
import Database from './Database/Database'

// Extensions
import DefaultExecutionStrategy from './Strategies/InputExecutionStrategies/DefaultExecutionStrategy'
import CommandExecutionStrategy from './Strategies/InputExecutionStrategies/CommandExecutionStrategy'
import InputCompletionStrategyRegister from './Strategies/InputCompletionStrategyRegister'
import InputExecutionStrategyRegister from './Strategies/InputExecutionStrategyRegister'
import BotrixExtension from './Extensions/Botrix'
import { EventService } from './EventServices/EventService'
import KickEventService from './EventServices/KickEventService'
import TwitchEventService from './EventServices/TwitchEventService'
import AnnouncementService from './Services/AnnouncementService'

class NipahClient {
	VERSION = '1.5.21'

	ENV_VARS = {
		LOCAL_RESOURCE_ROOT: 'http://localhost:3000/',
		// GITHUB_ROOT: 'https://github.com/Xzensi/NipahTV/raw/master',
		// GITHUB_ROOT: 'https://cdn.jsdelivr.net/gh/Xzensi/NipahTV@master',
		GITHUB_ROOT: 'https://raw.githubusercontent.com/Xzensi/NipahTV',
		RELEASE_BRANCH: 'master'
	}

	stylesLoaded = !__USERSCRIPT__
	eventBus: Publisher | null = null
	emotesManager: EmotesManager | null = null
	rootContext: RootContext | null = null
	loadSettingsManagerPromise: Promise<void> | null = null

	private database: DatabaseProxy | null = null
	private sessions: Session[] = []

	initialize() {
		const { ENV_VARS } = this

		info(`Initializing Nipah client [${this.VERSION}]..`)

		let resourceRoot: string
		if (__USERSCRIPT__ && __LOCAL__) {
			info('Running in debug mode enabled..')
			resourceRoot = ENV_VARS.LOCAL_RESOURCE_ROOT
			window.NipahTV = this
		} else if (!__USERSCRIPT__) {
			info('Running in extension mode..')
			resourceRoot = browser.runtime.getURL('/')
		} else {
			resourceRoot = ENV_VARS.GITHUB_ROOT + '/' + ENV_VARS.RELEASE_BRANCH + '/'
		}

		let platform = getPlatformId()
		if (platform === PLATFORM_ENUM.KICK) {
			info('Platform detected: Kick')
		} else if (platform === PLATFORM_ENUM.TWITCH) {
			info('Platform detected: Twitch')
		} else if (platform === PLATFORM_ENUM.YOUTUBE) {
			info('Platform detected: Youtube')
		} else {
			return error('Unsupported platform', window.location.host)
		}

		// Set global variables
		if (__USERSCRIPT__) {
			// Compiler automatically prefixes with NTV_ for userscripts to prevent
			//  global namespace pollution, unless accessed via window object.
			// @ts-expect-error
			window.NTV_APP_VERSION = this.VERSION
			// @ts-expect-error
			window.NTV_PLATFORM = platform
			// @ts-expect-error
			window.NTV_RESOURCE_ROOT = resourceRoot
		} else {
			// @ts-expect-error
			window.PLATFORM = platform
			// @ts-expect-error
			window.RESOURCE_ROOT = resourceRoot
			// @ts-expect-error
			window.APP_VERSION = this.VERSION
		}

		Object.freeze(APP_VERSION)
		Object.freeze(PLATFORM)
		Object.freeze(RESOURCE_ROOT)

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

		const rootEventBus = new Publisher('root')
		const settingsManager = new SettingsManager({ database, rootEventBus })
		settingsManager.initialize()

		let eventService: EventService
		if (PLATFORM === PLATFORM_ENUM.KICK) {
			eventService = new KickEventService()
		} else if (PLATFORM === PLATFORM_ENUM.TWITCH) {
			eventService = new TwitchEventService()
		} else {
			throw new Error('Unsupported platform')
		}

		//* The shared context for all sessions
		this.rootContext = {
			eventBus: rootEventBus,
			database,
			settingsManager,
			eventService,
			announcementService: new AnnouncementService(rootEventBus, settingsManager)
		}

		this.loadExtensions()

		this.loadSettingsManagerPromise = settingsManager.loadSettings().catch(err => {
			throw new Error(`Couldn't load settings because: ${err}`)
		})

		this.createChannelSession()
	}

	async loadExtensions() {
		// Dynamically load extensions according to enabled extensions
		const rootContext = this.rootContext
		if (!rootContext) throw new Error('Root context is not initialized.')

		const { settingsManager } = rootContext
		const isBotrixExtensionEnabled = true //await settingsManager.getSetting('shared', 'extensions.botrix.enabled')

		if (isBotrixExtensionEnabled) {
			const botrixExtension = new BotrixExtension(rootContext, this.sessions)
			botrixExtension.onEnable()
		}
	}

	async createChannelSession() {
		log(`Creating new session for ${window.location.href}...`)

		const rootContext = this.rootContext
		if (!rootContext) throw new Error('Root context is not initialized.')

		const { settingsManager, eventBus: rootEventBus } = rootContext

		const eventBus = new Publisher('session')
		const usersManager = new UsersManager({ eventBus, settingsManager })

		const session = {
			eventBus,
			usersManager,
			inputCompletionStrategyRegister: new InputCompletionStrategyRegister(),
			inputExecutionStrategyRegister: new InputExecutionStrategyRegister()
		} as Session

		if (PLATFORM === PLATFORM_ENUM.KICK) {
			session.networkInterface = new KickNetworkInterface(session)
		} else if (PLATFORM === PLATFORM_ENUM.TWITCH) {
			// session.networkInterface = new TwitchNetworkInterface()
			throw new Error('Twitch platform is not supported yet.')
		} else {
			throw new Error('Unsupported platform')
		}
		const networkInterface = session.networkInterface

		this.sessions.push(session)

		if (this.sessions.length > 1) this.cleanupSession(this.sessions[0].channelData.channelName)

		await Promise.allSettled([
			this.loadSettingsManagerPromise,
			networkInterface.loadMeData().catch(err => {
				throw new Error(`Couldn't load me data because: ${err}`)
			}),
			networkInterface.loadChannelData().catch(err => {
				throw new Error(`Couldn't load channel data because: ${err}`)
			})
		])

		if (!session.meData) throw new Error('Failed to load me user data.')
		if (!session.channelData) throw new Error('Failed to load channel data.')
		const channelData = session.channelData

		this.attachEventServiceListeners(rootContext, session)

		// badgeProvider: PLATFORM === PLATFORM_ENUM.KICK ? new KickBadgeProvider(rootContext, channelData) :
		session.badgeProvider = new KickBadgeProvider(rootContext, channelData)
		session.badgeProvider.initialize()

		const emotesManager = (this.emotesManager = new EmotesManager(rootContext, session))
		emotesManager.initialize()

		session.emotesManager = emotesManager

		session.inputExecutionStrategyRegister.registerStrategy(new DefaultExecutionStrategy(rootContext, session))
		session.inputExecutionStrategyRegister.registerStrategy(new CommandExecutionStrategy(rootContext, session))

		let userInterface: KickUserInterface
		if (PLATFORM === PLATFORM_ENUM.KICK) {
			userInterface = new KickUserInterface(rootContext, session)
		} else {
			return error('Platform has no user interface implemented..', PLATFORM)
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

	attachEventServiceListeners(rootContext: RootContext, session: Session) {
		const { eventBus, channelData, meData } = session

		if (channelData.isVod) return // VODs don't have chatrooms

		rootContext.eventService.subToChatroomEvents(channelData)

		rootContext.eventService.addEventListener(channelData, 'chatroom_updated', chatroomData => {
			const oldChatroomData = channelData.chatroom

			if (oldChatroomData?.emotesMode?.enabled !== chatroomData.emotesMode?.enabled) {
				eventBus.publish('ntv.channel.chatroom.emotes_mode.updated', chatroomData.emotesMode)
			} else if (oldChatroomData?.subscribersMode?.enabled !== chatroomData.subscribersMode?.enabled) {
				eventBus.publish('ntv.channel.chatroom.subscribers_mode.updated', chatroomData.subscribersMode)
			} else if (
				oldChatroomData?.followersMode?.enabled !== chatroomData.followersMode?.enabled ||
				oldChatroomData?.followersMode?.min_duration !== chatroomData.followersMode?.min_duration
			) {
				eventBus.publish('ntv.channel.chatroom.followers_mode.updated', chatroomData.followersMode)
			} else if (
				oldChatroomData?.slowMode?.enabled !== chatroomData.slowMode?.enabled ||
				oldChatroomData?.slowMode?.messageInterval !== chatroomData.slowMode?.messageInterval
			) {
				eventBus.publish('ntv.channel.chatroom.slow_mode.updated', chatroomData.slowMode)
			}

			channelData.chatroom = chatroomData
			eventBus.publish('ntv.channel.chatroom.updated', chatroomData)
		})

		let unbanTimeoutHandle: NodeJS.Timeout | null = null
		rootContext.eventService.addEventListener(channelData, 'user_banned', data => {
			eventBus.publish('ntv.channel.chatroom.user.banned', data)

			if (data.user.id === meData.userId) {
				log('You have been banned from the channel..')

				session.channelData.me.isBanned = {
					bannedAt: new Date().toISOString(),
					expiresAt: data.expiresAt,
					permanent: data.permanent,
					reason: '' // Reason is not provided by Kick here
				}
				eventBus.publish('ntv.channel.chatroom.me.banned', data)

				if (unbanTimeoutHandle) clearTimeout(unbanTimeoutHandle)
				if (!data.permanent) {
					unbanTimeoutHandle = setTimeout(() => {
						delete session.channelData.me.isBanned
						eventBus.publish('ntv.channel.chatroom.me.unbanned')
					}, data.duration * 60 * 1000)
				}
			}
		})

		rootContext.eventService.addEventListener(channelData, 'user_unbanned', data => {
			eventBus.publish('ntv.channel.chatroom.user.unbanned', data)

			if (data.user.id === meData.userId) {
				if (unbanTimeoutHandle) clearTimeout(unbanTimeoutHandle)
				log('You have been unbanned from the channel..')

				delete session.channelData.me.isBanned
				eventBus.publish('ntv.channel.chatroom.me.unbanned')
			}
		})
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
		let channelName: string | null = null

		const navigateFn = () => {
			if (locationURL === window.location.href) return

			// Kick sometimes navigates to weird KPSDK URLs that we don't want to handle
			if (window.location.pathname.match('^/[a-zA-Z0-9]{8}(?:-[a-zA-Z0-9]{4,12}){4}/.+')) return

			const oldLocation = locationURL
			const newLocation = window.location.href

			const activeSession = this.sessions[0]
			if (!activeSession) return this.createChannelSession()

			const newLocationChannelName = activeSession.networkInterface.getChannelName()
			const newLocationIsVod = activeSession.networkInterface.isVOD()

			// Check if session UI is actually destroyed or just part of page has changed
			if (
				!newLocationIsVod &&
				!activeSession.isDestroyed &&
				!activeSession.userInterface?.isContentEditableEditorDestroyed() &&
				channelName &&
				channelName === newLocationChannelName
			)
				return

			locationURL = newLocation
			channelName = newLocationChannelName
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

		window.addEventListener('beforeunload', () => {
			info('User is navigating away from the page, cleaning up sessions before leaving..')
			this.rootContext?.eventService.disconnectAll()
		})
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

	const nipahClient = new NipahClient()
	nipahClient.initialize()
})()
