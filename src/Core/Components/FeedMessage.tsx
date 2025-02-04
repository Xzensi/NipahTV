import { FeedBaseEntry, FeedEntryKind } from '@Core/@types/feedTypes'
import styles from './CSS/FeedMessage.module.css'

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
	| { kind: FeedMessageEntryContentPartKind.Emote; id: string }

export interface FeedMessageEntryProcessedData {
	username: string
	contentParts: FeedMessageEntryContentPart[]
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
			<span class={styles.username}>{props.processedData.username}</span>
			<span>
				{props.processedData.contentParts
					.map(part => {
						if (part.kind === FeedMessageEntryContentPartKind.Text && part.text) return part.text
						return ''
					})
					.join(' ')}
			</span>
		</div>
	)
}
