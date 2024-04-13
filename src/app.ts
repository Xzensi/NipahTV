// Classes
import { Publisher } from './Classes/Publisher'
import { EmotesManager } from './Managers/EmotesManager'
import { KickUserInterface } from './UserInterface/KickUserInterface'

// Providers
import { KickProvider } from './Providers/KickProvider'
import { SevenTVProvider } from './Providers/SevenTVProvider'

// Utils
import { PLATFORM_ENUM, PROVIDER_ENUM } from './constants'
import { log, info, error, fetchJSON } from './utils'
import { SettingsManager } from './Managers/SettingsManager'
import { AbstractUserInterface } from './UserInterface/AbstractUserInterface'

class NipahClient {
	ENV_VARS = {
		VERSION: '1.3.6',
		PLATFORM: PLATFORM_ENUM.NULL,
		RESOURCE_ROOT: null as string | null,
		LOCAL_RESOURCE_ROOT: 'http://localhost:3000/',
		// GITHUB_ROOT: 'https://github.com/Xzensi/NipahTV/raw/master',
		// GITHUB_ROOT: 'https://cdn.jsdelivr.net/gh/Xzensi/NipahTV@master',
		GITHUB_ROOT: 'https://raw.githubusercontent.com/Xzensi/NipahTV',
		RELEASE_BRANCH: 'master',
		DATABASE_NAME: 'NipahTV',
		LOCAL_ENV: IS_LOCAL_ENV,
		IS_USERSCRIPT: IS_USERSCRIPT
	}

	userInterface: AbstractUserInterface | null = null
	stylesLoaded = false
	eventBus: Publisher | null = null
	emotesManager: EmotesManager | null = null
	private database: Dexie | null = null
	private channelData: ChannelData | null = null

	initialize() {
		const { ENV_VARS } = this

		info(`Initializing Nipah client [${ENV_VARS.VERSION}]..`)

		if (IS_USERSCRIPT && ENV_VARS.LOCAL_ENV) {
			info('Running in debug mode enabled..')
			ENV_VARS.RESOURCE_ROOT = ENV_VARS.LOCAL_RESOURCE_ROOT
			wwindow.NipahTV = this
		} else if (!IS_USERSCRIPT) {
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
		this.setupDatabase()
		this.setupClientEnvironment().catch(err => error('Failed to setup client environment.', err.message))
	}

	setupDatabase() {
		const { ENV_VARS } = this

		// Open the database
		const database = (this.database = new Dexie(ENV_VARS.DATABASE_NAME))
		database.version(1).stores({
			settings: '&id',
			emoteHistory: '&[channelId+emoteHid]'
		})
	}

	async setupClientEnvironment() {
		const { ENV_VARS, database } = this
		if (!database) throw new Error('Database is not initialized.')

		log('Setting up client environment..')

		const eventBus = new Publisher()
		this.eventBus = eventBus

		const settingsManager = new SettingsManager({ database, eventBus })
		settingsManager.initialize()

		const promises = []
		promises.push(
			settingsManager.loadSettings().catch(err => {
				throw new Error(`Couldn't load settings. ${err}`)
			})
		)
		promises.push(
			this.loadChannelData().catch(err => {
				throw new Error(`Couldn't load channel data. ${err}`)
			})
		)
		await Promise.all(promises)

		const channelData = this.channelData
		if (!channelData) throw new Error('Channel data has not loaded yet.')

		const emotesManager = (this.emotesManager = new EmotesManager(
			{ database, eventBus, settingsManager },
			channelData.channel_id
		))
		emotesManager.initialize()

		let userInterface: KickUserInterface
		if (ENV_VARS.PLATFORM === PLATFORM_ENUM.KICK) {
			userInterface = new KickUserInterface({ ENV_VARS, channelData, eventBus, settingsManager, emotesManager })
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

		// Test whether UI works correctly when loading is delayed
		// setTimeout(() => userInterface.loadInterface(), 3000)
	}

	loadStyles() {
		if (!IS_USERSCRIPT) return Promise.resolve()

		return new Promise((resolve, reject) => {
			info('Injecting styles..')

			if (this.ENV_VARS.LOCAL_ENV) {
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

	async loadChannelData() {
		if (this.ENV_VARS.PLATFORM === PLATFORM_ENUM.KICK) {
			const channelData = {}

			const pathArr = wwindow.location.pathname.substring(1).split('/')
			if (pathArr[0] === 'video') {
				info('VOD video detected..')

				// We are on a VOD page
				const videoId = pathArr[1]
				if (!videoId) throw new Error('Failed to extract video ID from URL')

				// We extract channel data from the Kick API
				const responseChannelData = await fetchJSON(`https://kick.com/api/v1/video/${videoId}`).catch(() => {})
				if (!responseChannelData) {
					throw new Error('Failed to fetch VOD data')
				}
				if (!responseChannelData.livestream) {
					throw new Error('Invalid VOD data, missing property "livestream"')
				}

				const { id, user_id, slug, user } = responseChannelData.livestream.channel
				if (!id) {
					throw new Error('Invalid VOD data, missing property "id"')
				}
				if (!user_id) {
					throw new Error('Invalid VOD data, missing property "user_id"')
				}
				if (!user) {
					throw new Error('Invalid VOD data, missing property "user"')
				}

				Object.assign(channelData, {
					user_id,
					channel_id: id,
					channel_name: user.username,
					is_vod: true,
					me: {}
				})
			} else {
				// We extract channel name from the URL
				const channelName = pathArr[0]
				if (!channelName) throw new Error('Failed to extract channel name from URL')

				// We extract channel data from the Kick API
				const responseChannelData = await fetchJSON(`https://kick.com/api/v2/channels/${channelName}`)
				if (!responseChannelData) {
					throw new Error('Failed to fetch channel data')
				}
				if (!responseChannelData.id) {
					throw new Error('Invalid channel data, missing property "id"')
				}
				if (!responseChannelData.user_id) {
					throw new Error('Invalid channel data, missing property "user_id"')
				}

				Object.assign(channelData, {
					user_id: responseChannelData.user_id,
					channel_id: responseChannelData.id,
					channel_name: channelName,
					me: {}
				})
			}

			const channelName = (channelData as any).channel_name as string
			const responseChannelMeData = await fetchJSON(`https://kick.com/api/v2/channels/${channelName}/me`).catch(
				() => {}
			)
			if (responseChannelMeData) {
				Object.assign(channelData, {
					me: {
						is_subscribed: !!responseChannelMeData.subscription,
						is_following: !!responseChannelMeData.is_following,
						is_super_admin: !!responseChannelMeData.is_super_admin,
						is_broadcaster: !!responseChannelMeData.is_broadcaster,
						is_moderator: !!responseChannelMeData.is_moderator,
						is_banned: !!responseChannelMeData.banned
					}
				})
			} else {
				info('User is not logged in.')
			}

			this.channelData = channelData as ChannelData
		}
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

;(async () => {
	const IS_USERSCRIPT = typeof unsafeWindow !== 'undefined'
	const wwindow: CustomWindow = IS_USERSCRIPT ? (unsafeWindow as CustomWindow) : (window as any as CustomWindow)
	wwindow.wwindow = wwindow
	wwindow.IS_USERSCRIPT = IS_USERSCRIPT

	if (IS_USERSCRIPT) {
		info('Running in userscript mode..')
	}

	if (!IS_USERSCRIPT && !wwindow['browser']) {
		if (typeof chrome === 'undefined') {
			return error('Unsupported browser, please use a modern browser to run NipahTV.')
		}
		wwindow.browser = chrome
	}

	if (!Dexie) {
		return error('Failed to import Dexie')
	}

	if (!Fuse) {
		return error('Failed to import Fuse')
	}

	if (!twemoji) {
		return error('Failed to import Twemoji')
	}

	const nipahClient = new NipahClient()
	nipahClient.initialize()

	// if (IS_USERSCRIPT) {
	// 	nipahClient.initialize()
	// } else {
	// 	// Promise.allSettled([
	// 	// 	import(chrome.runtime.getURL('dist/vendor/jquery.min.js')),
	// 	// 	import(chrome.runtime.getURL('dist/vendor/dexie.min.js')),
	// 	// 	import(chrome.runtime.getURL('dist/vendor/fuse.min.js')),
	// 	// 	import(chrome.runtime.getURL('dist/vendor/twemoji.min.js'))
	// 	// ])
	// 	// 	.then(results => {
	// 	// 		// Check if any import failed
	// 	// 		const failedImports = results.filter(result => result.status === 'rejected')
	// 	// 		if (failedImports.length > 0) {
	// 	// 			const errors = failedImports.map((importResult: any) => importResult.reason)
	// 	// 			// Reject the promise chain with an error containing the reasons for the failed imports
	// 	// 			return Promise.reject(
	// 	// 				new Error(`Failed to load one or more vendor scripts: \n\n${errors.join('\n\n')}`)
	// 	// 			)
	// 	// 		}

	// 	// 		if (!wwindow.Dexie) {
	// 	// 			throw new Error('Failed to import Dexie')
	// 	// 		}

	// 	// 		if (!wwindow.Fuse) {
	// 	// 			throw new Error('Failed to import Fuse')
	// 	// 		}

	// 	// 		const TwemojiModule = results[3] as any
	// 	// 		wwindow.twemoji = TwemojiModule.value.default

	// 	// 		if (!wwindow.twemoji) {
	// 	// 			throw new Error('Failed to import Twemoji')
	// 	// 		}

	// 	// 		nipahClient.initialize()
	// 	// 	})
	// 	// 	.catch(err => {
	// 	// 		error('Failed to load vendor imports..', err)
	// 	// 	})
	// }
})()
