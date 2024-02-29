import { AbstractProvider } from './AbstractProvider'
import { PROVIDER_ENUM } from '../constants'
import { log, info, error, fetchJSON } from '../utils'

export class KickProvider extends AbstractProvider {
	id = PROVIDER_ENUM.KICK
	status = 'unloaded'

	constructor(datastore, settingsManager) {
		super(datastore)
		this.settingsManager = settingsManager
	}

	async fetchEmotes({ channel_id, channel_name, user_id, me }) {
		if (!channel_id) return error('Missing channel id for Kick provider')
		if (!channel_name) return error('Missing channel name for Kick provider')

		const { settingsManager } = this

		const includeGlobalEmoteSet = settingsManager.getSetting('shared.chat.emote_providers.kick.filter_global')
		const includeCurrentChannelEmoteSet = settingsManager.getSetting(
			'shared.chat.emote_providers.kick.filter_current_channel'
		)
		const includeOtherChannelEmoteSets = settingsManager.getSetting(
			'shared.chat.emote_providers.kick.filter_other_channels'
		)
		const includeEmojiEmoteSet = settingsManager.getSetting('shared.chat.emote_providers.kick.filter_emojis')

		info('Fetching emote data from Kick..')
		const data = await fetchJSON(`https://kick.com/emotes/${channel_name}`)

		let dataFiltered = data
		if (!includeGlobalEmoteSet) {
			dataFiltered = dataFiltered.filter(entry => entry.id !== 'Global')
		}
		if (!includeEmojiEmoteSet) {
			dataFiltered = dataFiltered.filter(entry => entry.id !== 'Emoji')
		}
		if (!includeCurrentChannelEmoteSet) {
			dataFiltered = dataFiltered.filter(entry => entry.id !== channel_id)
		}
		if (!includeOtherChannelEmoteSets) {
			dataFiltered = dataFiltered.filter(entry => !entry.user_id)
		}

		const emoteSets = []
		for (const dataSet of dataFiltered) {
			const { emotes } = dataSet

			// Filter out sub emotes when not subscribed
			//  only need to check for the current channel's emotes
			let emotesFiltered = emotes
			if (dataSet.user_id === user_id) {
				emotesFiltered = emotes.filter(emote => me.is_subscribed || !emote.subscribers_only)
			}
			const emotesMapped = emotesFiltered.map(emote => ({
				id: '' + emote.id,
				name: emote.name,
				provider: PROVIDER_ENUM.KICK,
				width: 32,
				size: 1
			}))

			const emoteSetIcon = dataSet?.user?.profile_pic || 'https://kick.com/favicon.ico'
			const emoteSetName = dataSet.user ? `${dataSet.user.username}'s Emotes` : `${dataSet.name} Emotes`

			emoteSets.push({
				provider: this.id,
				order_index: dataSet.id === 'Global' ? 5 : 1,
				name: emoteSetName,
				emotes: emotesMapped,
				icon: emoteSetIcon,
				id: '' + dataSet.id
			})
		}

		if (!emoteSets.length) {
			log('No emote sets found on Kick provider with current settings.')
			this.status = 'no_emotes_found'
			return []
		}

		if (emoteSets.length > 1) {
			log(`Fetched ${emoteSets.length} emote sets from Kick`)
		} else {
			log(`Fetched 1 emote set from Kick`)
		}
		this.status = 'loaded'
		return emoteSets
	}

	getRenderableEmote(emote, classes = '') {
		const srcset = `https://files.kick.com/emotes/${emote.id}/fullsize 1x`

		return `<img class="${classes}" tabindex="0" size="1" :data-emote-name="${emote.name}" data-emote-id="${emote.id}" alt="${emote.name}" srcset="${srcset}" loading="lazy" decoding="async" draggable="false">`
	}

	getEmbeddableEmote(emote) {
		return `[emote:${emote.id}:${emote.name}]`
	}

	getEmoteSrc(emote) {
		return `https://files.kick.com/emotes/${emote.id}/fullsize`
	}
}
