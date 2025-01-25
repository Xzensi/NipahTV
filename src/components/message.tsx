import { createEffect, createSignal, For, Show } from 'solid-js'
import styles from './message.module.css'

export interface Message {
	username: string
	content: string
}

export default function MessageComponent(props: Message & { offset: number }) {
	return (
		<div class={styles.message} style={{ transform: `translateY(${props.offset | 0}px)` }}>
			<span class={styles.username}>{props.username}</span>
			<span>{props.content}</span>
		</div>
	)
}
