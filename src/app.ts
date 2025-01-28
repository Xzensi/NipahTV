// Classes
import InputExecutionStrategyRegister from './Core/Input/Execution/InputExecutionStrategyRegister'
import DefaultExecutionStrategy from './Core/Input/Execution/Strategies/DefaultExecutionStrategy'
import CommandExecutionStrategy from './Core/Input/Execution/Strategies/CommandExecutionStrategy'
import InputCompletionStrategyRegister from './Core/Input/Completion/InputCompletionStrategyRegister'
import { DatabaseProxyFactory, DatabaseProxy } from './Database/DatabaseProxy'
import RenderMessagePipeline from '@core/Common/RenderMessagePipeline'
import AnnouncementService from './Core/Services/AnnouncementService'
import AbstractUserInterface from './Core/UI/AbstractUserInterface'
import TwitchEventService from './Sites/Twitch/TwitchEventService'
import SettingsManager from './Core/Settings/SettingsManager'
import KickEventService from './Sites/Kick/KickEventService'
import { EventService } from './Core/Common/EventService'
import EmotesManager from './Core/Emotes/EmotesManager'
import UsersManager from './Core/Users/UsersManager'
import Publisher from './Core/Common/Publisher'
import Database from './Database/Database'

// Utils
import {
	RESTFromMain,
	debounce,
	getPlatformId,
	waitForElements,
	getBrowser,
	getDevice,
	hasSupportForAvif,
	ReactivePropsFromMain
} from './Core/Common/utils'
import { PLATFORM_ENUM, PROVIDER_ENUM } from './Core/Common/constants'

// Sites
import { KickUserInterface } from './Sites/Kick/KickUserInterface'
import KickNetworkInterface from './Sites/Kick/KickNetworkInterface'
import KickEmoteProvider from './Sites/Kick/KickEmoteProvider'
import KickBadgeProvider from './Sites/Kick/KickBadgeProvider'
import TwitchNetworkInterface from './Sites/Twitch/TwitchNetworkInterface'

// Extensions
import { Extension } from './Extensions/Extension'
import SevenTVExtension from './Extensions/SevenTV'
import BotrixExtension from './Extensions/Botrix'
import { Logger } from '@core/Common/Logger'

const logger = new Logger()
const { log, info, error } = logger.destruct()

class NipahClient {
	VERSION = '1.5.68'

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

	private database: DatabaseProxy<Database> | null = null
	private sessions: Session[] = []

	async initialize() {
		const { ENV_VARS } = this

		info('CORE', 'INIT', `Initializing Nipah client [${this.VERSION}]..`)

		let resourceRoot: string
		if (__USERSCRIPT__ && __LOCAL__) {
			info('CORE', 'INIT', 'Running in debug mode enabled..')
			resourceRoot = ENV_VARS.LOCAL_RESOURCE_ROOT
			window.NipahTV = this
		} else if (!__USERSCRIPT__) {
			info('CORE', 'INIT', 'Running in extension mode..')
			resourceRoot = browser.runtime.getURL('/')
		} else {
			resourceRoot = ENV_VARS.GITHUB_ROOT + '/' + ENV_VARS.RELEASE_BRANCH + '/'
		}

		let platform = getPlatformId()
		if (platform === PLATFORM_ENUM.KICK) {
			info('CORE', 'INIT', 'Platform detected: Kick')
		} else if (platform === PLATFORM_ENUM.TWITCH) {
			info('CORE', 'INIT', 'Platform detected: Twitch')
		} else if (platform === PLATFORM_ENUM.YOUTUBE) {
			info('CORE', 'INIT', 'Platform detected: Youtube')
		} else {
			return error('CORE', 'INIT', 'Unsupported platform', window.location.host)
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
			// @ts-expect-error
			window.NTV_BROWSER = await getBrowser()
			// @ts-expect-error
			window.NTV_DEVICE = getDevice()
			// @ts-expect-error
			window.NTV_SUPPORTS_AVIF = await hasSupportForAvif()
		} else {
			// @ts-expect-error
			window.PLATFORM = platform
			// @ts-expect-error
			window.RESOURCE_ROOT = resourceRoot
			// @ts-expect-error
			window.APP_VERSION = this.VERSION
			// @ts-expect-error
			window.BROWSER = await getBrowser()
			// @ts-expect-error
			window.DEVICE = getDevice()
			// @ts-expect-error
			window.SUPPORTS_AVIF = await hasSupportForAvif()
		}

		Object.freeze(APP_VERSION)
		Object.freeze(PLATFORM)
		Object.freeze(RESOURCE_ROOT)
		Object.freeze(BROWSER)
		Object.freeze(DEVICE)
		Object.freeze(SUPPORTS_AVIF)

		this.attachPageNavigationListener()
		this.setupDatabase().then(async () => {
			// Initialize the RESTFromMainService because it needs to
			//  inject page script for Firefox extension.
			window.RESTFromMainService = new RESTFromMain()
			window.ReactivePropsFromMain = new ReactivePropsFromMain()
			await this.injectPageScript()

			this.setupClientEnvironment().catch(err =>
				error('CORE', 'INIT', 'Failed to setup client environment.\n\n', err.message)
			)
		})
	}

	injectPageScript() {
		return new Promise((resolve, reject) => {
			// Firefox Manifest V2 does not support content script in execution context MAIN
			//  So we need to inject the page script manually
			if (__FIREFOX_MV2__) {
				const s = document.createElement('script')
				s.src = browser.runtime.getURL('page.js')
				s.onload = function () {
					s.remove()
					resolve(void 0)
				}
				s.onerror = function () {
					error('CORE', 'INIT', 'Failed to load page script..')
					reject(void 0)
				}
				;(document.head || document.documentElement).appendChild(s)
			} else {
				resolve(void 0)
			}
		})
	}

	setupDatabase() {
		// TODO Only ask for persistent storage when we low on of space
		// if (navigator.storage && navigator.storage.persist) {
		// 	navigator.storage.persist().then(persistent => {
		// 		if (persistent) {
		// 			info('CORE', 'INIT','Storage will not be cleared except by explicit user action')
		// 		} else {
		// 			info('CORE', 'INIT','Storage may be cleared by the UA under storage pressure.')
		// 		}
		// 	})
		// }

		return new Promise((resolve, reject) => {
			const database: Database = __USERSCRIPT__
				? DatabaseProxyFactory.create('NipahTV', new Database())
				: DatabaseProxyFactory.create('NipahTV')

			database
				.checkCompatibility()
				.then(() => {
					log('CORE', 'INIT', 'Database passed compatibility check.')
					this.database = database

					resolve(void 0)
				})
				.catch((err: Error) => {
					error('CORE', 'INIT', 'Failed to open database because:', err)
					reject()
				})
		})
	}

	async setupClientEnvironment() {
		const { database } = this
		if (!database) throw new Error('Database is not initialized.')

		info('CORE', 'INIT', 'Setting up client environment..')

		const rootEventBus = new Publisher('ROOT')
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
			announcementService: new AnnouncementService(rootEventBus, settingsManager),
			renderMessagePipeline: new RenderMessagePipeline()
		}

		this.loadExtensions()

		this.loadSettingsManagerPromise = settingsManager
			.loadSettings()
			.then(() => {
				log('CORE', 'SETUP', 'Settings loaded successfully.')

				const appVersion = settingsManager.getGlobalSetting('app.version')
				if (!appVersion || appVersion !== this.VERSION) {
					settingsManager.setGlobalSetting('app.version', this.VERSION)
				}

				// Semver string comparison to check if the current version is newer than the stored version
				const updateAvailableVersion = settingsManager.getGlobalSetting('app.update_available')
				if (updateAvailableVersion && updateAvailableVersion <= this.VERSION) {
					settingsManager.setGlobalSetting('app.update_available', null)
				}
			})
			.catch(err => {
				throw new Error(`Couldn't load settings because: ${err}`)
			})

		this.loadAppUpdateBehaviour(rootEventBus)
		this.doExtensionCompatibilityChecks()
		this.createChannelSession()
	}

	loadAppUpdateBehaviour(rootEventBus: Publisher) {
		rootEventBus.subscribe('ntv.app.update', () => {
			info('CORE', 'MAIN', 'Extension update has been requested, reloading extension..')

			browser.runtime
				.sendMessage({
					action: 'runtime.reload'
				})
				.then(() => {
					info('CORE', 'MAIN', 'Reloading page after runtime reload..')
					location.reload()
				})
				.catch(err => {
					error('CORE', 'MAIN', 'Failed to reload extension.', err)
					location.reload()
				})
		})
	}

	async loadExtensions() {
		const rootContext = this.rootContext
		if (!rootContext) throw new Error('Root context is not initialized.')

		const { settingsManager } = rootContext

		let sevenTVExtension: SevenTVExtension | null = null
		const enableSevenTVExtension = () => {
			sevenTVExtension = new SevenTVExtension(rootContext, this.sessions)
			sevenTVExtension.onEnable()
		}
		const isSevenTVExtensionEnabled = await settingsManager.getSettingFromDatabase('global.shared.ext.7tv.enabled')
		if (isSevenTVExtensionEnabled) enableSevenTVExtension()
		rootContext.eventBus.subscribe(
			'ntv.settings.change.ext.7tv.enabled',
			({ value, prevValue }: { value: boolean; prevValue: boolean }) => {
				if (value && !prevValue) enableSevenTVExtension()
				else if (sevenTVExtension) {
					sevenTVExtension.onDisable()
					sevenTVExtension = null
				}
			}
		)

		const enableBotrixExtension = () => {
			const extension = new BotrixExtension(rootContext, this.sessions)
			extension.onEnable()
		}
		const isBotrixExtensionEnabled = true //await settingsManager.getSettingFromDatabase('shared', 'extensions.botrix.enabled')
		if (isBotrixExtensionEnabled) enableBotrixExtension()
	}

	doExtensionCompatibilityChecks() {
		info('CORE', 'INIT', 'Checking for extension compatibility issues..')

		const rootContext = this.rootContext
		if (!rootContext) throw new Error('Root context is not initialized.')
		const { announcementService, eventBus: rootEventBus } = rootContext

		waitForElements(['#seventv-site-hosted'], 6000)
			.then(() => {
				log('CORE', 'INIT', 'Detected SevenTV extension')
				const platformName = PLATFORM[0].toUpperCase() + PLATFORM.slice(1)

				announcementService.registerAnnouncement({
					id: 'seventv_conflict',
					title: 'NipahTV Compatibility Warning',
					showDontShowAgainButton: true,
					showCloseButton: true,
					message: `
					<h2>⚠️ <strong>7TV Extension Conflict!</strong> ⚠️</h2>
					<p>The 7TV extension has been found to be enabled on ${platformName}. 7TV is not compatible with NipahTV and will cause issues if both are enabled at the same time. It is possible to keep the 7TV extension for <b>other</b> streaming websites if you want, by disabling the extension for only ${platformName}.</p>
					<h4>How to disable 7TV extension <i>only</i> just for ${platformName}?</h4>
					<p>If you want to keep 7TV for other streaming websites instead of uninstalling it completely, please follow the instructions on <a href="https://nipahtv.com/seventv_compatibility" target="_blank">https://nipahtv.com/seventv_compatibility</a>.</p>
					<p>Feel free to join the <a href="https://discord.gg/KZZZYM6ESs" target="_blank">NipahTV Discord community</a> if you need help with this.</p>
					<br>
					<p>You can ignore this warning if you want, but expect weird issues such as blank and empty messages.</p>
				`
				})
				announcementService.displayAnnouncement('seventv_conflict')
			})
			.catch(() => {})
	}

	async createChannelSession() {
		log('CORE', 'MAIN', `Creating new session for ${window.location.href}...`)

		const rootContext = this.rootContext
		if (!rootContext) throw new Error('Root context is not initialized.')

		const { settingsManager, eventBus: rootEventBus } = rootContext

		const eventBus = new Publisher('SESSION')

		const session = {
			eventBus,
			inputCompletionStrategyRegister: new InputCompletionStrategyRegister(),
			inputExecutionStrategyRegister: new InputExecutionStrategyRegister()
		} as Session

		session.usersManager = new UsersManager(rootContext, session)

		if (PLATFORM === PLATFORM_ENUM.KICK) {
			session.networkInterface = new KickNetworkInterface(session)
		} else if (PLATFORM === PLATFORM_ENUM.TWITCH) {
			// session.networkInterface = new TwitchNetworkInterface()
			throw new Error('Twitch platform is not supported yet.')
		} else {
			throw new Error('Unsupported platform')
		}

		const networkInterface = session.networkInterface
		const promiseRes = await Promise.allSettled([
			this.loadSettingsManagerPromise,
			networkInterface.loadMeData().catch(err => {
				throw `Couldn't load me data because: ${err.message}`
			}),
			networkInterface.loadChannelData().catch(err => {
				throw `Couldn't load channel data because: ${err.message}`
			})
		])

		// Check if any of these promises failed and bubble up the error
		for (const res of promiseRes) {
			if (res.status === 'rejected') return error('CORE', 'MAIN', 'Failed to create session because:', res.reason)
		}

		if (!session.meData) throw new Error('Failed to load me user data.')
		if (!session.channelData) throw new Error('Failed to load channel data.')

		this.sessions.push(session)

		const channelData = session.channelData
		eventBus.publish('ntv.channel.loaded.channel_data', channelData)

		const disableModCreatorView = settingsManager.getSetting(
			channelData.channelId,
			'moderators.mod_creator_view.disable_ntv'
		)
		if (disableModCreatorView && (channelData.isModView || channelData.isCreatorView)) {
			info('CORE', 'MAIN', 'NipahTV is disabled for this channel in mod/creator view.')
			return
		}

		this.attachEventServiceListeners(rootContext, session)

		// badgeProvider: PLATFORM === PLATFORM_ENUM.KICK ? new KickBadgeProvider(rootContext, channelData) :
		session.badgeProvider = new KickBadgeProvider(rootContext, channelData)
		session.badgeProvider.initialize()

		const emotesManager = (this.emotesManager = new EmotesManager(rootContext, session))
		emotesManager.initialize()

		session.emotesManager = emotesManager

		session.inputExecutionStrategyRegister.registerStrategy(new DefaultExecutionStrategy(rootContext, session))
		session.inputExecutionStrategyRegister.registerStrategy(new CommandExecutionStrategy(rootContext, session))

		let userInterface: AbstractUserInterface
		if (PLATFORM === PLATFORM_ENUM.KICK) {
			userInterface = new KickUserInterface(rootContext, session)
		} else {
			return error('CORE', 'MAIN', 'Platform has no user interface implemented..', PLATFORM)
		}

		session.userInterface = userInterface

		if (PLATFORM === PLATFORM_ENUM.KICK) {
			emotesManager.registerProvider(KickEmoteProvider)
		} else if (PLATFORM === PLATFORM_ENUM.TWITCH) {
			throw new Error('Twitch platform is not supported yet.')
		} else {
			throw new Error('Unsupported platform')
		}

		rootEventBus.publish('ntv.session.create', session)

		if (!this.stylesLoaded) {
			this.loadStyles()
				.then(() => {
					this.stylesLoaded = true
					userInterface.loadInterface()
				})
				.catch(response => error('CORE', 'INIT', 'Failed to load styles.', response))
		} else {
			userInterface.loadInterface()
		}

		const providerOverrideOrder = [PROVIDER_ENUM.SEVENTV, PROVIDER_ENUM.KICK]
		emotesManager.loadProviderEmotes(channelData, providerOverrideOrder)

		//! Dirty reload UI hack to check if UI elements of session is destroyed and reload it
		eventBus.subscribe(
			'ntv.session.reload',
			debounce(() => {
				if (session.isDestroyed) return

				this.cleanupSessions(true)
				this.createChannelSession()
			}, 1000)
		)
	}

	attachEventServiceListeners(rootContext: RootContext, session: Session) {
		const { eventBus, channelData, meData } = session

		if (channelData.isVod) return // VODs don't have chatrooms

		rootContext.eventService.subToChatroomEvents(channelData)

		rootContext.eventService.addEventListener(channelData, 'MESSAGE', message => {
			eventBus.publish('ntv.chat.message.new', message, true)
		})

		rootContext.eventService.addEventListener(channelData, 'CHATROOM_UPDATED', chatroomData => {
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
		rootContext.eventService.addEventListener(channelData, 'USER_BANNED', data => {
			eventBus.publish('ntv.channel.chatroom.user.banned', data)

			if (data.user.id === meData.userId) {
				log('CORE', 'MAIN', 'You have been banned from the channel..')

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

		rootContext.eventService.addEventListener(channelData, 'USER_UNBANNED', data => {
			eventBus.publish('ntv.channel.chatroom.user.unbanned', data)

			if (data.user.id === meData.userId) {
				if (unbanTimeoutHandle) clearTimeout(unbanTimeoutHandle)
				log('CORE', 'MAIN', 'You have been unbanned from the channel..')

				delete session.channelData.me.isBanned
				eventBus.publish('ntv.channel.chatroom.me.unbanned')
			}
		})
	}

	loadStyles() {
		if (__EXTENSION__) return Promise.resolve()

		return new Promise((resolve, reject) => {
			info('CORE', 'INIT', 'Injecting styles..')

			if (__LOCAL__) {
				// * Add permission for GM_xmlhttpRequest to make
				// *  requests to the resource root for development.
				// * @grant GM.xmlHttpRequest
				GM_xmlhttpRequest({
					method: 'GET',
					url: RESOURCE_ROOT + 'dist/userscript/kick.css',
					onerror: () => reject('Failed to load local stylesheet'),
					onload: function (response: any) {
						log('CORE', 'MAIN', 'Loaded styles from local resource..')
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
		info('CORE', 'MAIN', 'Current URL:', window.location.href)
		let locationURL = window.location.href

		const navigateFn = () => {
			if (locationURL === window.location.href) return

			// Kick sometimes navigates to weird KPSDK URLs that we don't want to handle
			if (window.location.pathname.match('^/[a-zA-Z0-9]{8}(?:-[a-zA-Z0-9]{4,12}){4}/.+')) return

			const prevLocation = locationURL
			const newLocation = window.location.href

			locationURL = newLocation
			log('CORE', 'MAIN', 'Navigated to:', newLocation)

			// It's ugly, but prev session is guaranteed to exist at this point
			const prevSession = this.sessions[0]

			if (prevSession) {
				const prevChannelName = prevSession.channelData.channelName
				const newLocationChannelName = prevSession.networkInterface.getChannelName()
				const newLocationIsVod = prevSession.networkInterface.isVOD()

				// Check if session UI is actually destroyed or just part of page has changed
				if (
					!newLocationIsVod &&
					!prevSession.isDestroyed &&
					!prevSession.userInterface?.isContentEditableEditorDestroyed() &&
					prevChannelName === newLocationChannelName
				)
					return log('CORE', 'MAIN', 'Session UI is not destroyed, only part of page has changed..')
			}

			info('CORE', 'MAIN', 'Navigated to:', locationURL)

			this.cleanupSessions()
			log('CORE', 'MAIN', 'Cleaned up old session for', prevLocation)

			this.createChannelSession()
			this.doExtensionCompatibilityChecks()
		}

		if (window.navigation) {
			window.navigation.addEventListener('navigate', debounce(navigateFn, 100))
		} else {
			setInterval(navigateFn, 200)
		}

		window.addEventListener('beforeunload', () => {
			info('CORE', 'MAIN', 'User is navigating away from the page, cleaning up sessions before leaving..')
			this.rootContext?.eventService.disconnectAll()
			this.cleanupSessions()
		})
	}

	cleanupSessions(restoreOriginalUI = false) {
		for (const session of this.sessions) {
			log(
				'CORE',
				'MAIN',
				`Cleaning up previous session for channel ${
					session?.channelData?.channelName || '[CHANNEL NOT LOADED]'
				}...`
			)
			session.isDestroyed = true
			session.eventBus.publish('ntv.session.destroy')
			if (restoreOriginalUI) session.eventBus.publish('ntv.session.restore_original')
			this.rootContext?.eventBus.publish('ntv.session.destroy', session)
			session.eventBus.destroy()
			// TODO after session is destroyed, all session event listeners attached to rootEventBus should be removed as well
		}

		this.sessions = []
	}
}

;(() => {
	// Kick sometimes navigates to weird KPSDK URLs that we don't want to handle
	if (window.location.pathname.match('^/[a-zA-Z0-9]{8}(?:-[a-zA-Z0-9]{4,12}){4}/.+')) {
		log('CORE', 'MAIN', 'KPSDK URL detected, bailing out..')
		return
	}

	if (__USERSCRIPT__) {
		info('CORE', 'INIT', 'Running in userscript mode..')
	}

	if (!__USERSCRIPT__) {
		if (!window['browser'] && !globalThis['browser']) {
			if (undefined === chrome) {
				return error('CORE', 'INIT', 'Unsupported browser, please use a modern browser to run NipahTV.')
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
