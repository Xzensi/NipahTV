import { AbstractProvider } from './AbstractProvider'
import { PLATFORM_ENUM } from '../constants'
import { log, info, error, fetchJSON } from '../utils'

export class KickProvider extends AbstractProvider {
	id = PLATFORM_ENUM.KICK
	status = 'unloaded'

	constructor(datastore) {
		super(datastore)
	}

	async fetchEmotes({ kick_channel_id, kick_channel_name }) {
		if (!kick_channel_id) return error('Missing channel id for Kick provider')
		if (!kick_channel_name) return error('Missing channel name for Kick provider')

		info('Fetching emote data from Kick..')
		const data = await fetchJSON(`https://kick.com/emotes/${kick_channel_name}`)
		const dataFiltered = data.filter(entry => entry.id === kick_channel_id || entry.id === 'Global')

		const emoteSets = []
		for (const dataSet of dataFiltered) {
			const { emotes, subscription_enabled } = dataSet

			// Filter out sub emotes when not subscribed
			const emotesFiltered = emotes.filter(
				emote => !emote.subscription_enabled || (emote.subscribers_only && subscription_enabled)
			)
			const emotesMapped = emotesFiltered.map(emote => ({
				id: '' + emote.id,
				name: emote.name,
				provider: PLATFORM_ENUM.KICK,
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
			log('No emotes found on Kick provider')
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

	getRenderableEmote(emote) {
		const srcset = `https://files.kick.com/emotes/${emote.id}/fullsize 1x`

		return `
			<img class="nipah_emote" tabindex="0" size="1" data-emote-id="${emote.id}" alt="${emote.name}" srcset="${srcset}" loading="lazy" decoding="async" draggable="false">
		`
	}

	getEmbeddableEmote(emote) {
		const src = `https://files.kick.com/emotes/${emote.id}/fullsize`
		return `<img :data-emote-name="${emote.name}" class="gc-emote-c" data-emote-id="${emote.id}" src="${src}">`
	}

	getEmoteSrc(emote) {
		return `https://files.kick.com/emotes/${emote.id}/fullsize`
	}
}
