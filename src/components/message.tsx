import { createEffect, createSignal, For, Show } from 'solid-js'
import styles from './message.module.css'

export interface Message {
	id: string
	username: string
	content: string
}

export default function MessageComponent(
	props: Message & { offset: number; ref: HTMLDivElement | ((el: HTMLDivElement) => void) }
) {
	return (
		<div
			data-uid={props.id}
			class={`${styles.message} ntv__message`}
			style={{ transform: `translateY(${props.offset | 0}px)` }}
			ref={props.ref}>
			<span class={styles.username}>{props.username}</span>
			<span>{props.content}</span>
		</div>
	)
}
