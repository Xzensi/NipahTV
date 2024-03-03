import { AbstractProvider } from './AbstractProvider'
import { PROVIDER_ENUM } from '../constants'
import { log, info, error, fetchJSON, md5 } from '../utils'

export class SevenTVProvider extends AbstractProvider {
	id = PROVIDER_ENUM.SEVENTV
	status = 'unloaded'

	constructor(datastore, settingsManager) {
		super(datastore)
		this.settingsManager = settingsManager
	}

	async fetchEmotes({ user_id }) {
		info('Fetching emote data from SevenTV..')
		if (!user_id) return error('Missing kick channel id for SevenTV provider.')

		const data = await fetchJSON(`https://7tv.io/v3/users/KICK/${user_id}`)
		if (!data.emote_set || !data.emote_set.emotes.length) {
			log('No emotes found on SevenTV provider')
			this.status = 'no_emotes_found'
			return []
		}

		// const test = new Set()
		const emotesMapped = data.emote_set.emotes.map(emote => {
			const file = emote.data.host.files[0]
			// test.add(file.width)
			let size
			switch (true) {
				case file.width > 74:
					size = 4
					break
				case file.width > 53:
					size = 3
					break
				case file.width > 32:
					size = 2
					break
				default:
					size = 1
			}
			return {
				id: '' + emote.id,
				hid: md5(emote.name),
				name: emote.name,
				provider: PROVIDER_ENUM.SEVENTV,
				subscribers_only: false,
				spacing: true,
				width: file.width,
				size
			}
		})
		// log('SIZES:', Array.from(test).sort())

		log(`Fetched 1 emote set from SevenTV.`)
		this.status = 'loaded'

		return [
			{
				provider: this.id,
				order_index: 2,
				name: data.emote_set.name,
				emotes: emotesMapped,
				is_current_channel: false,
				is_subscribed: false,
				icon: data.emote_set?.user?.avatar_url || 'https://7tv.app/favicon.ico',
				id: '' + data.emote_set.id
			}
		]
	}

	getRenderableEmote(emote, classes = '') {
		const srcset = `https://cdn.7tv.app/emote/${emote.id}/1x.avif 1x, https://cdn.7tv.app/emote/${emote.id}/2x.avif 2x, https://cdn.7tv.app/emote/${emote.id}/3x.avif 3x, https://cdn.7tv.app/emote/${emote.id}/4x.avif 4x`

		return `<img class="${classes}" tabindex="0" size="${emote.size}" data-emote-name="${emote.name}" data-emote-hid="${emote.hid}" alt="${emote.name}" srcset="${srcset}" loading="lazy" decoding="async" draggable="false">`
	}

	getEmbeddableEmote(emote) {
		return emote.name
	}

	getEmoteSrc(emote) {
		return `https://cdn.7tv.app/emote/${emote.id}/4x.avif`
	}
}
