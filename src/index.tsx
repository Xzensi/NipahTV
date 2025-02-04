/// <reference types="vite-plugin-monkey/client" />
/* @refresh reload */

import { FeedMessageEntryContentPartKind } from '@Core/Components/FeedMessage'
import FeedProcessorPipeline from '@Core/Feed/FeedProcessorPipeline'
import ChatFeedController from '@Core/Chat/ChatFeedController'
import { FeedEntryKind } from '@Core/@types/feedTypes'
import FeedView from '@Core/Components/FeedView'
import styles from './styles.module.css'
import { render } from 'solid-js/web'

const { log, error } = console

const feedController = new ChatFeedController()
const feedProcessor = new FeedProcessorPipeline({ view: 'chat_feed' })

feedProcessor.use((executionContext, context, data) => {
	if (context.kind === FeedEntryKind.Message) {
		data.username = context.username

		const emotes = [
			'KEKW',
			'PogU',
			'hmmge',
			'OMEGALUL',
			'SUSSY',
			'xdd',
			'Jigglin',
			'DonkAim',
			'OkaygeL',
			'forsenCD'
		]

		// Split up the text between emotes as text and emotes as emotes
		// E.g. "That was INSANE! PogU" -> [{text: 'That was INSANE!', kind: FeedMessageEntryContentPartKind.Text}, {id: 'abcc123', name: 'PogU', kind: FeedMessageEntryContentPartKind.Emote}]

		const parts = context.content.split(' ')
		data.contentParts = parts
			.map(part => {
				const emote = emotes.find(emote => part.includes(emote))
				if (emote) {
					const index = part.indexOf(emote)
					const before = part.slice(0, index)
					const after = part.slice(index + emote.length)
					const result = []
					if (before) result.push({ text: before, kind: FeedMessageEntryContentPartKind.Text })
					result.push({ id: 'abcd123', name: emote, kind: FeedMessageEntryContentPartKind.Emote })
					if (after) result.push({ text: after, kind: FeedMessageEntryContentPartKind.Text })
					return result
				}
				return { text: part, kind: FeedMessageEntryContentPartKind.Text }
			})
			.flat()
	}
})

// Simulate new messages being added to chat
const loop = () => {
	feedController.simulateMessage()

	const delay = 1 + (Math.sin(Date.now() / 4_000) / 2 + 0.5) * 300
	// const delay = 500
	// log(delay)
	setTimeout(loop, delay)
}

setTimeout(loop, 20)

function App() {
	return (
		<>
			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
			<link
				href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
				rel="stylesheet"
			/>

			<div class={styles.chatContainer}>
				<FeedView feedController={feedController} feedProcessor={feedProcessor} />
			</div>
		</>
	)
}

function main() {
	document.body.innerHTML = ''
	render(App, document.body)
}

if (document.readyState === 'complete') main()
else document.addEventListener('DOMContentLoaded', main, { once: true })
