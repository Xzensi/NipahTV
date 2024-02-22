'use strict'

const window = unsafeWindow || window

// Classes
import { Publisher } from './Publisher'
import { EmotesManager } from './EmotesManager'
import { KickUserInterface } from './UserInterface/KickUserInterface'

// Providers
import { KickProvider } from './Providers/KickProvider'
import { SevenTVProvider } from './Providers/SevenTVProvider'

// Utils
import { PLATFORM_ENUM } from './constants'
import { log, info, error, fetchJSON } from './utils'
import { SettingsManager } from './SettingsManager'

class NipahClient {
	ENV_VARS = {
		VERSION: '1.0.9',
		PLATFORM: PLATFORM_ENUM.NULL,
		LOCAL_RESOURCE_ROOT: 'http://localhost:3000',
		// RESOURCE_ROOT: 'https://github.com/Xzensi/NipahTV/raw/master',
		// RESOURCE_ROOT: 'https://cdn.jsdelivr.net/gh/Xzensi/NipahTV@master',
		RESOURCE_ROOT: 'https://raw.githubusercontent.com/Xzensi/NipahTV/master',
		DEBUG: false
	}

	stylesLoaded = false

	async initialize() {
		const { ENV_VARS } = this

		info(`Initializing Nipah client [${ENV_VARS.VERSION}]..`)

		if (ENV_VARS.DEBUG) {
			ENV_VARS.RESOURCE_ROOT = ENV_VARS.LOCAL_RESOURCE_ROOT
		}

		if (window.app_name === 'Kick') {
			this.ENV_VARS.PLATFORM = PLATFORM_ENUM.KICK
			info('Platform detected: Kick')
		} else {
			return error('Unsupported platform', window.app_name)
		}

		this.attachPageNavigationListener()
		this.setupClientEnvironment()
	}

	async setupClientEnvironment() {
		const { ENV_VARS } = this

		const eventBus = new Publisher()
		this.eventBus = eventBus

		const settingsManager = new SettingsManager(eventBus)
		settingsManager.initialize()
		settingsManager.loadSettings()

		const channelData = await this.loadChannelData()
		if (!channelData) return error('Failed to load channel data')

		const emotesManager = new EmotesManager({ eventBus, settingsManager }, channelData.kick_channel_id)

		let userInterface
		if (ENV_VARS.PLATFORM === PLATFORM_ENUM.KICK) {
			userInterface = new KickUserInterface({ ENV_VARS, eventBus, settingsManager, emotesManager })
		} else {
			return error('Platform has no user interface imlemented..', ENV_VARS.PLATFORM)
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

		emotesManager.registerProvider(KickProvider)
		emotesManager.registerProvider(SevenTVProvider)

		const providerLoadOrder = [PLATFORM_ENUM.KICK, PLATFORM_ENUM.SEVENTV]
		emotesManager.loadProviderEmotes(channelData, providerLoadOrder)

		// Test whether UI works correctly when data loading is delayed
		// setTimeout(() => userInterface.loadInterface(), 3000)
	}

	loadStyles() {
		return new Promise((resolve, reject) => {
			info('Injecting styles..')

			if (this.ENV_VARS.DEBUG) {
				// * Add permission for GM_xmlhttpRequest to make
				// *  requests to the resource root for development.
				// * @grant GM.xmlHttpRequest
				GM_xmlhttpRequest({
					method: 'GET',
					url: this.ENV_VARS.RESOURCE_ROOT + '/dist/css/kick.min.css',
					onerror: reject,
					onload: function (response) {
						GM_addStyle(response.responseText)
						resolve()
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
				resolve()
			}
		})
	}

	async loadChannelData() {
		// We extract channel name from the URL
		const channelName = window.location.pathname.substring(1).split('/')[0]
		if (!channelName) throw new Error('Failed to extract channel name from URL')

		// We extract channel data from the Kick API
		const channelRequestData = await fetchJSON(`https://kick.com/api/v2/channels/${channelName}`)
		if (!channelRequestData) {
			throw new Error('Failed to fetch channel data')
		}
		if (!channelRequestData.id || !channelRequestData.user_id) {
			throw new Error('Invalid channel data')
		}

		const channelData = {
			kick_user_id: channelRequestData.user_id,
			kick_channel_id: channelRequestData.id,
			kick_channel_name: channelName
		}

		this.channelData = channelData

		return channelData
	}

	attachPageNavigationListener() {
		info('Current URL:', window.location.href)
		let locationURL = window.location.href

		if (window.navigation) {
			window.navigation.addEventListener('navigate', event => {
				setTimeout(() => {
					if (locationURL === window.location.href) return
					locationURL = window.location.href

					info('Navigated to:', window.location.href)

					this.cleanupOldClientEnvironment()
					this.setupClientEnvironment()
				}, 100)
			})
		} else {
			setInterval(() => {
				if (locationURL !== window.location.href) {
					locationURL = window.location.href
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
			this.eventBus.publish('nipah.session.destroy')
			this.eventBus = null
		}
	}
}

info('Running Nipah Client script.')
log('Waiting for platform to load..')
const awaitLoadInterval = setInterval(() => {
	if (window.app_name !== 'Kick') {
		return
	}

	log('Platform loaded.')
	clearInterval(awaitLoadInterval)
	let nipahClient = new NipahClient()
	nipahClient.initialize()
}, 100)
