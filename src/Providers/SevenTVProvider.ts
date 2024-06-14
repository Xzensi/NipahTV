import { AbstractEmoteProvider, IAbstractEmoteProvider, EmoteProviderDependencies } from './AbstractEmoteProvider'
import { log, info, error, REST, md5 } from '../utils'
import { PROVIDER_ENUM } from '../constants'

export class SevenTVProvider extends AbstractEmoteProvider implements IAbstractEmoteProvider {
	id = PROVIDER_ENUM.SEVENTV
	status = 'unloaded'

	constructor(dependencies: EmoteProviderDependencies) {
		super(dependencies)
	}

	async fetchEmotes({ userId }: ChannelData) {
		info('Fetching emote data from SevenTV..')
		if (!userId) return error('Missing Kick channel id for SevenTV provider.')

		const data = await REST.get(`https://7tv.io/v3/users/KICK/${userId}`).catch(err => {
			error('Failed to fetch SevenTV emotes.', err)
			this.status = 'connection_failed'
			return []
		})
		if (!data.emote_set || !data.emote_set?.emotes?.length) {
			log('No emotes found for SevenTV provider')
			this.status = 'no_emotes_found'
			return []
		}

		// const test = new Set()
		const emotesMapped = data.emote_set.emotes.map((emote: any) => {
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
				subscribersOnly: false,
				spacing: true,
				width: file.width,
				size
			} as Emote
		})
		// log('SIZES:', Array.from(test).sort())

		log(`Fetched 1 emote set from SevenTV.`)
		this.status = 'loaded'

		return [
			{
				provider: this.id,
				orderIndex: 2,
				name: data.emote_set.name,
				emotes: emotesMapped,
				isCurrentChannel: false,
				isSubscribed: false,
				icon: data.emote_set?.user?.avatar_url || 'https://7tv.app/favicon.ico',
				id: '' + data.emote_set.id
			} as EmoteSet
		]
	}

	getRenderableEmote(emote: Emote, classes = '') {
		const srcset = `https://cdn.7tv.app/emote/${emote.id}/1x.avif 1x, https://cdn.7tv.app/emote/${emote.id}/2x.avif 2x, https://cdn.7tv.app/emote/${emote.id}/3x.avif 3x, https://cdn.7tv.app/emote/${emote.id}/4x.avif 4x`

		return `<img class="${classes}" tabindex="0" size="${emote.size}" data-emote-name="${emote.name}" data-emote-hid="${emote.hid}" alt="${emote.name}" srcset="${srcset}" loading="lazy" decoding="async" draggable="false">`
	}

	getEmbeddableEmote(emote: Emote) {
		return emote.name
	}

	getEmoteSrc(emote: Emote) {
		return `https://cdn.7tv.app/emote/${emote.id}/4x.avif`
	}
}
