import { FeedBaseEntry, FeedEntryKind } from '@Core/@types/feedTypes'
import styles from './CSS/FeedMessage.module.css'

const { log, error } = console

export interface FeedMessageEntry extends FeedBaseEntry {
	kind: FeedEntryKind.Message
	username: string
	content: string
}

export const enum FeedMessageEntryContentPartKind {
	Text = 0,
	Emote = 1
}

export type FeedMessageEntryContentPart =
	| { kind: FeedMessageEntryContentPartKind.Text; text: string }
	| { kind: FeedMessageEntryContentPartKind.Emote; id: string; name: string }

export interface FeedMessageEntryProcessedData {
	username: string
	contentParts: FeedMessageEntryContentPart[]
}

function getEmoteURL(name: string) {
	switch (name) {
		case 'KEKW':
			return 'https://cdn.7tv.app/emote/01F61B1440000991F7SWQNMVX7/1x.avif'
		case 'PogU':
			return 'https://cdn.7tv.app/emote/01F6M3N17G000B5V5G2M2RYJN7/1x.avif'
		case 'hmmge':
			return 'https://cdn.7tv.app/emote/01HN4AZB38000ANGK62QEHFB0R/1x.avif'
		case 'OMEGALUL':
			return 'https://cdn.7tv.app/emote/01F00Z3A9G0007E4VV006YKSK9/1x.avif'
		case 'SUSSY':
			return 'https://cdn.7tv.app/emote/01F8G9MDAR0009YQPYZYCKHYKQ/1x.avif'
		case 'xdd':
			return 'https://cdn.7tv.app/emote/01FF3R5C30000FF5VVCKV49G6J/1x.avif'
		case 'Jigglin':
			return 'https://cdn.7tv.app/emote/01GA0HWQ7R0001VT2F11KM5EZM/1x.avif'
		case 'DonkAim':
			return 'https://cdn.7tv.app/emote/01FWH0DB180005X0GSGVKFK1G2/1x.avif'
		case 'OkaygeL':
			return 'https://cdn.7tv.app/emote/01F1AVKZN0000BN42J006MA1W3/1x.avif'
		case 'forsenCD':
			return 'https://cdn.7tv.app/emote/01EZPRG5RR0002RYT500A3PHPQ/1x.avif'
	}
}

function randomPastelColor() {
	let hue = Math.floor(Math.random() * 341)
	let saturation = 80
	let lightness = 50

	if (hue > 215 && hue < 265) {
		const gain = 20
		let blueness = 1 - Math.abs(hue - 240) / 25
		let change = Math.floor(gain * blueness)
		lightness += change
		saturation -= change
	}

	return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

export default function FeedMessage(props: {
	offset: number
	data: FeedMessageEntry
	processedData: FeedMessageEntryProcessedData
	ref: HTMLDivElement | ((el: HTMLDivElement) => void)
}) {
	return (
		<div
			data-uid={props.data.id}
			class={`${styles.container} ntv__message`}
			style={{ transform: `translateY(${props.offset | 0}px)` }}
			ref={props.ref}>
			<div class={`${styles.identity}`}>
				<span class={styles.timestamp}></span>
				<span class={styles.badges}></span>
				<span class={styles.username} style={{ color: randomPastelColor() }}>
					{props.processedData.username}
				</span>
				<span class={styles.identitySeperator}>:</span>
			</div>
			{props.processedData.contentParts.map(part => {
				if (part.kind === FeedMessageEntryContentPartKind.Text)
					return <span class={`${styles.contentPart}`}>{part.text}</span>
				else if (part.kind === FeedMessageEntryContentPartKind.Emote) {
					return (
						<div class={`${styles.contentPart}`} contentEditable={false}>
							<div class={`${styles.emoteBox}`}>
								<img
									class={`${styles.emote}`}
									src={getEmoteURL(part.name)}
									decoding="async"
									loading="lazy"
									draggable="false"
								/>
							</div>
						</div>
					)
				}

				error('Invalid FeedMessageEntryContentPart:', part)
				return ''
			})}
		</div>
	)
}
