/// <reference types="vite-plugin-monkey/client" />
/* @refresh reload */

import { FeedMessageEntryContentPartKind } from '@Core/Components/FeedMessage'
import FeedProcessorPipeline from '@Core/Feed/FeedProcessorPipeline'
import ChatFeedController from '@Core/ChatFeedController'
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
		data.contentParts = context.content
			.split(' ')
			.map(word => ({ text: word, kind: FeedMessageEntryContentPartKind.Text }))
		// log(data.contentParts)
	}
})

// Simulate new messages being added to chat
const loop = () => {
	feedController.simulateMessage()

	// const delay = 1 + (Math.sin(Date.now() / 8_000) / 2 + 0.5) * 300
	// const delay = 500
	// log(delay)
	// setTimeout(loop, delay)
}

setTimeout(loop, 100)
// setTimeout(loop, 200)

function App() {
	return (
		<div class={styles.chatContainer}>
			<FeedView feedController={feedController} feedProcessor={feedProcessor} />
		</div>
	)
}

function main() {
	document.body.innerHTML = ''
	render(App, document.body)
}

if (document.readyState === 'complete') main()
else document.addEventListener('DOMContentLoaded', main, { once: true })
