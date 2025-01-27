/// <reference types="vite-plugin-monkey/client" />
/* @refresh reload */

import { render } from 'solid-js/web'
import styles from './styles.module.css'
import ChatWindow from '@Components/ChatList'
import ChatController from 'ChatController'

const { log, error } = console

const chatController = new ChatController()

// Simulate new messages being added to chat
setInterval(() => {
	chatController.simulateMessage()
}, 100)

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
			<ChatWindow chatController={chatController} />
		</div>
	)
}

function main() {
	document.body.innerHTML = ''
	render(App, document.body)
}

if (document.readyState === 'complete') main()
else document.addEventListener('DOMContentLoaded', main, { once: true })
