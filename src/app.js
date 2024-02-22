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
		VERSION: '1.0.0',
		PLATFORM: PLATFORM_ENUM.NULL,
		LOCAL_RESOURCE_ROOT: 'http://localhost:3000',
		// RESOURCE_ROOT: 'https://github.com/Xzensi/NipahTV/raw/master',
		// RESOURCE_ROOT: 'https://cdn.jsdelivr.net/gh/Xzensi/NipahTV@master',
		RESOURCE_ROOT: 'https://raw.githubusercontent.com/Xzensi/NipahTV/master',
		DEBUG: false
	}

	async initialize() {
		info(`Initializing Nipah client ${this.VERSION}..`)

		const { ENV_VARS } = this

		if (ENV_VARS.DEBUG) {
			ENV_VARS.RESOURCE_ROOT = ENV_VARS.LOCAL_RESOURCE_ROOT
		}

		if (window.app_name === 'Kick') {
			this.ENV_VARS.PLATFORM = PLATFORM_ENUM.KICK
			info('Platform detected: Kick')
		} else {
			return error('Unsupported platform', window.app_name)
		}

		const eventBus = new Publisher()

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

		this.loadStyles()
			.then(() => {
				userInterface.loadInterface()
			})
			.catch(response => error('Failed to load styles.', response))

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
					url: this.ENV_VARS.RESOURCE_ROOT + '/dist/css/kick.css',
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

	initKeyboardShortcuts() {}
}

info('Running Nipah Client script.')
log('Waiting for message input field..')
const awaitLoadInterval = setInterval(() => {
	if (window.app_name !== 'Kick' || !document.getElementById('message-input')) {
		return
	}

	log('Message input field found.')
	clearInterval(awaitLoadInterval)
	setTimeout(() => {
		const nipahClient = new NipahClient()
		nipahClient.initialize()
	}, 1500)
}, 100)
