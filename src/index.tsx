/// <reference types="vite-plugin-monkey/client" />
/* @refresh reload */

import ChatController from '@Core/ChatController'
import FeedView from '@Core/Components/FeedView'
import styles from './styles.module.css'
import { render } from 'solid-js/web'

const { log, error } = console

const chatController = new ChatController()

// Simulate new messages being added to chat
const loop = () => {
	chatController.simulateMessage()

	const delay = 1 + (Math.sin(Date.now() / 8_000) / 2 + 0.5) * 300
	// log(delay)
	setTimeout(loop, delay)
}

loop()

// setTimeout(() => {
// 	chatController.simulateMessage()
// 	chatController.simulateMessage()
// 	chatController.simulateMessage()
// 	chatController.simulateMessage()
// 	chatController.simulateMessage()
// 	chatController.simulateMessage()
// 	chatController.simulateMessage()
// 	chatController.simulateMessage()
// 	chatController.simulateMessage()
// 	chatController.simulateMessage()
// 	chatController.simulateMessage()
// 	chatController.simulateMessage()
// 	chatController.simulateMessage()
// 	chatController.simulateMessage()
// 	chatController.simulateMessage()
// 	chatController.simulateMessage()
// 	chatController.simulateMessage()
// 	chatController.simulateMessage()
// 	// chatController.simulateMessage()
// }, 10)

function App() {
	return (
		<div class={styles.chatContainer}>
			<FeedView chatController={chatController} />
		</div>
	)
}

function main() {
	document.body.innerHTML = ''
	render(App, document.body)
}

if (document.readyState === 'complete') main()
else document.addEventListener('DOMContentLoaded', main, { once: true })
