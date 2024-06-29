import type { InputController } from '../Managers/InputController'
import { ReplyMessageComponent } from './Components/ReplyMessageComponent'
import { MessagesHistory } from '../Classes/MessagesHistory'
import { UserInfoModal } from './Modals/UserInfoModal'
import { Clipboard2 } from '../Classes/Clipboard'
import { assertArgDefined, cleanupHTML, error, log, parseHTML } from '../utils'
import { Toaster } from '../Classes/Toaster'
import { PollModal } from './Modals/PollModal'
import { parse as twemojiParse } from '@twemoji/parser'

function getEmojiAttributes() {
	return {
		height: '30px',
		width: '30px'
	}
}

export abstract class AbstractUserInterface {
	protected rootContext: RootContext
	protected session: Session

	protected inputController: InputController | null = null
	protected clipboard = new Clipboard2()
	protected toaster = new Toaster()
	protected messageHistory = new MessagesHistory()

	protected replyMessageData?: {
		chatEntryId: string
		chatEntryContentString: string
		chatEntryUsername: string
		chatEntryUserId: string
	}

	protected abstract elm: {
		replyMessageWrapper: HTMLElement | null
	}

	protected replyMessageComponent?: ReplyMessageComponent

	protected maxMessageLength = 500

	/**
	 * @param {EventBus} eventBus
	 * @param {object} deps
	 */
	constructor(rootContext: RootContext, session: Session) {
		this.rootContext = rootContext
		this.session = session
	}

	loadInterface() {
		const { eventBus } = this.rootContext

		eventBus.subscribe('ntv.ui.show_modal.user_info', (data: { username: string }) => {
			assertArgDefined(data.username)
			this.showUserInfoModal(data.username)
		})

		eventBus.subscribe('ntv.ui.show_modal.poll', () => {
			new PollModal(this.rootContext, this.session, { toaster: this.toaster }).init()
		})

		// Render ntv-tooltip tooltips
		document.addEventListener('mouseover', evt => {
			const target = evt.target as HTMLElement
			const tooltip = target.getAttribute('ntv-tooltip')
			if (!tooltip) return

			const rect = target.getBoundingClientRect()
			const left = rect.left + rect.width / 2
			const top = rect.top

			const tooltipEl = parseHTML(
				`<div class="ntv__tooltip" style="top: ${top}px; left: ${left}px;">${tooltip}</div>`,
				true
			) as HTMLElement

			document.body.appendChild(tooltipEl)

			target.addEventListener(
				'mouseleave',
				() => {
					tooltipEl.remove()
				},
				{ once: true, passive: true }
			)
		})
	}

	toastSuccess(message: string) {
		this.toaster.addToast(message, 4_000, 'success')
	}

	toastError(message: string) {
		error(message)
		this.toaster.addToast(message, 4_000, 'error')
	}

	renderEmotesInString(textContent: string) {
		const { emotesManager } = this.rootContext
		const tokens = textContent.split(' ')
		const newNodes = []

		let textBuffer = ''
		for (const token of tokens) {
			const emoteHid = emotesManager.getEmoteHidByName(token)
			if (emoteHid) {
				if (textBuffer) {
					textBuffer = textBuffer.trim()
					const nodes = []

					const entities = twemojiParse(textBuffer)
					if (entities.length) {
						const entitiesLength = entities.length
						for (let i = 0; i < entitiesLength; i++) {
							const entity = entities[i]
							const emojiNode = document.createElement('img')
							emojiNode.className = 'ntv__inline-emoji'
							emojiNode.src = entity.url
							emojiNode.alt = entity.text

							const stringStart = textBuffer.slice(entities[i - 1]?.indices[1] || 0, entity.indices[0])
							const stringEnd = textBuffer.slice(
								entity.indices[1],
								entities[i + 1]?.indices[0] || textBuffer.length
							)

							stringStart.length && nodes.push(document.createTextNode(stringStart))
							nodes.push(emojiNode)
							stringEnd.length && nodes.push(document.createTextNode(stringEnd))
						}
					} else {
						nodes.push(document.createTextNode(textBuffer))
					}

					const newNode = document.createElement('span')
					newNode.append(...nodes)
					newNode.classList.add('ntv__chat-message__part', 'ntv__chat-message--text')
					newNodes.push(newNode)
					textBuffer = ''
				}

				const newNode = document.createElement('span')
				newNode.innerHTML = emotesManager.getRenderableEmoteByHid(emoteHid)
				newNode.classList.add('ntv__chat-message__part', 'ntv__inline-emote-box')
				newNode.setAttribute('data-emote-hid', emoteHid)
				newNode.setAttribute('contenteditable', 'false')
				newNodes.push(newNode)
			} else if (token) {
				textBuffer += token + ' '
			}
		}

		if (textBuffer) {
			textBuffer = textBuffer.trim()
			const nodes = []

			const entities = twemojiParse(textBuffer)
			if (entities.length) {
				const entitiesLength = entities.length
				for (let i = 0; i < entitiesLength; i++) {
					const entity = entities[i]
					const emojiNode = document.createElement('img')
					emojiNode.className = 'ntv__inline-emoji'
					emojiNode.src = entity.url
					emojiNode.alt = entity.text

					const stringStart = textBuffer.slice(entities[i - 1]?.indices[1] || 0, entity.indices[0])
					const stringEnd = textBuffer.slice(
						entity.indices[1],
						entities[i + 1]?.indices[0] || textBuffer.length
					)

					nodes.push(document.createTextNode(stringStart))
					nodes.push(emojiNode)
					nodes.push(document.createTextNode(stringEnd))
				}
			} else {
				nodes.push(document.createTextNode(textBuffer))
			}

			const newNode = document.createElement('span')
			newNode.append(...nodes)
			newNode.classList.add('ntv__chat-message__part', 'ntv__chat-message--text')
			newNodes.push(newNode)
		}

		return newNodes
	}

	changeInputStatus(status: 'enabled' | 'disabled', reason?: string | null) {
		if (!this.inputController) return error('Input controller not loaded yet.')
		const contentEditableEditor = this.inputController.contentEditableEditor

		if (status === 'enabled') {
			contentEditableEditor.enableInput()
			contentEditableEditor.setPlaceholder('Send message..')
		} else if (status === 'disabled') {
			contentEditableEditor.clearInput()
			contentEditableEditor.setPlaceholder(reason || 'Chat is disabled')
			contentEditableEditor.disableInput()
		}
	}

	showUserInfoModal(username: string, position?: { x: number; y: number }) {
		log('Loading user info modal..')
		return new UserInfoModal(
			this.rootContext,
			this.session,
			{
				toaster: this.toaster
			},
			username,
			position
		).init()
	}

	// Submits input to chat
	submitInput(suppressEngagementEvent?: boolean, dontClearInput?: boolean) {
		const { eventBus, networkInterface } = this.rootContext
		const contentEditableEditor = this.inputController?.contentEditableEditor
		if (!contentEditableEditor) return error('Unable to submit input, the input controller is not loaded yet.')

		if (contentEditableEditor.getCharacterCount() > this.maxMessageLength) {
			return this.toastError('Message is too long to send.')
		}

		const replyContent = contentEditableEditor.getMessageContent()
		if (!replyContent.length) return log('No message content to send.')

		if (this.replyMessageData) {
			const { chatEntryId, chatEntryContentString, chatEntryUserId, chatEntryUsername } = this.replyMessageData
			networkInterface
				.sendReply(replyContent, chatEntryId, chatEntryContentString, chatEntryUserId, chatEntryUsername)
				.then(res => {
					if (res.status.error) {
						if (res.status.message)
							this.toastError('Failed to send reply message because: ' + res.status.message)
						else this.toaster.addToast('Failed to send reply message.', 4_000, 'error')
						error('Failed to send reply message:', res.status)
					}
				})
				.catch(err => {
					this.toaster.addToast('Failed to send reply message.', 4_000, 'error')
					error('Failed to send reply message:', err)
				})

			this.destroyReplyMessageContext()
		} else {
			networkInterface
				.sendMessage(replyContent)
				.then(res => {
					if (res?.status.error) {
						if (res.status.message) this.toastError('Failed to send message because: ' + res.status.message)
						else this.toaster.addToast('Failed to send message.', 4_000, 'error')
						error('Failed to send message:', res.status)
					}
				})
				.catch(err => {
					this.toaster.addToast('Failed to send emote to chat.', 4_000, 'error')
					error('Failed to send emote to chat:', err)
				})
		}

		eventBus.publish('ntv.ui.input_submitted', { suppressEngagementEvent })

		dontClearInput || contentEditableEditor.clearInput()
	}

	sendEmoteToChat(emoteHid: string) {
		const { emotesManager, networkInterface } = this.rootContext
		const emoteEmbedding = emotesManager.getEmoteEmbeddable(emoteHid)
		if (!emoteEmbedding) return error('Failed to send emote to chat, emote embedding not found.')

		networkInterface
			.sendMessage(emoteEmbedding)
			.then(res => {
				if (res?.status.error) {
					if (res.status.message) this.toastError('Failed to send emote because: ' + res.status.message)
					else this.toaster.addToast('Failed to send emote to chat.', 4_000, 'error')
					error('Failed to send emote to chat:', res.status)
				}
			})
			.catch(err => {
				this.toastError('Failed to send emote to chat.')
			})
	}

	replyMessage(
		messageNodes: Element[],
		chatEntryId: string,
		chatEntryContentString: string,
		chatEntryUserId: string,
		chatEntryUsername: string
	) {
		log(`Replying to message ${chatEntryId} of user ${chatEntryUsername} with ID ${chatEntryUserId}..`)

		if (!this.inputController) return error('Input controller not loaded for reply behaviour')
		if (!this.elm.replyMessageWrapper) return error('Unable to load reply message, reply message wrapper not found')
		if (this.replyMessageData) this.destroyReplyMessageContext()

		this.replyMessageData = {
			chatEntryId,
			chatEntryContentString,
			chatEntryUsername,
			chatEntryUserId
		}

		this.replyMessageComponent = new ReplyMessageComponent(this.elm.replyMessageWrapper, messageNodes).init()
		this.replyMessageComponent.addEventListener('close', () => {
			this.destroyReplyMessageContext()
		})
	}

	destroyReplyMessageContext() {
		this.replyMessageComponent?.destroy()
		delete this.replyMessageComponent
		delete this.replyMessageData
	}

	abstract renderChatMessage(messageNode: HTMLElement): void
}
