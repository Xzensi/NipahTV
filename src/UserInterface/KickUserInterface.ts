import { log, info, error, assertArgDefined, waitForElements, cleanupHTML } from '../utils'
import { QuickEmotesHolderComponent } from './Components/QuickEmotesHolderComponent'
import { EmoteMenuButtonComponent } from './Components/EmoteMenuButtonComponent'
import { EmoteMenuComponent } from './Components/EmoteMenuComponent'
import { AbstractUserInterface } from './AbstractUserInterface'
import { InputController } from '../Classes/InputController'
import { TabCompletor } from '../Classes/TabCompletor'
import { Clipboard2 } from '../Classes/Clipboard'
import { Caret } from './Caret'

export class KickUserInterface extends AbstractUserInterface {
	abortController = new AbortController()

	inputController: InputController | null = null
	chatObserver: MutationObserver | null = null
	emoteMenu: EmoteMenuComponent | null = null
	emoteMenuButton: EmoteMenuButtonComponent | null = null
	quickEmotesHolder: QuickEmotesHolderComponent | null = null
	tabCompletor: TabCompletor | null = null

	elm: {
		$originalTextField: JQuery<HTMLElement> | null
		$originalSubmitButton: JQuery<HTMLElement> | null
		$chatMessagesContainer: JQuery<HTMLElement> | null
		$submitButton: JQuery<HTMLElement> | null
		$textField: JQuery<HTMLElement> | null
	} = {
		$originalTextField: null,
		$originalSubmitButton: null,
		$chatMessagesContainer: null,
		$submitButton: null,
		$textField: null
	}
	stickyScroll = true
	maxMessageLength = 500

	constructor(deps: any) {
		super(deps)
	}

	async loadInterface() {
		info('Creating user interface..')

		const { eventBus, settingsManager, abortController } = this
		const abortSignal = abortController.signal

		// Wait for text input to load
		waitForElements(['#message-input'], 5_000, abortSignal)
			.then(() => {
				this.loadShadowProxyTextField()

				this.loadEmoteMenu()
				this.loadChatHistoryBehaviour()
				this.loadTabCompletionBehaviour()
			})
			.catch(() => {})

		// Wait for quick emotes holder to load
		waitForElements(['#chatroom-footer .quick-emotes-holder'], 5_000, abortSignal)
			.then(() => {
				this.loadQuickEmotesHolder()
			})
			.catch(() => {})

		// Wait for submit button to load
		waitForElements(['#chatroom-footer button.base-button'], 5_000, abortSignal)
			.then(() => {
				this.loadShadowProxySubmitButton()
				this.loadEmoteMenuButton()

				if (settingsManager.getSetting('shared.chat.appearance.hide_emote_menu_button')) {
					$('#chatroom').addClass('ntv__hide-emote-menu-button')
				}

				if (settingsManager.getSetting('shared.chat.behavior.smooth_scrolling')) {
					$('#chatroom').addClass('ntv__smooth-scrolling')
				}
			})
			.catch(() => {})

		// Wait for chat messages container to load
		waitForElements(['#chatroom > div:nth-child(2) > .overflow-y-scroll'], 5_000, abortSignal)
			.then(() => {
				const $chatMessagesContainer = (this.elm.$chatMessagesContainer = $(
					'#chatroom > div:nth-child(2) > .overflow-y-scroll'
				))

				// Add alternating background color to chat messages
				if (settingsManager.getSetting('shared.chat.appearance.alternating_background')) {
					$('#chatroom').addClass('ntv__alternating-background')
				}

				// Add seperator lines to chat messages
				const seperatorSettingVal = settingsManager.getSetting('shared.chat.appearance.seperators')
				if (seperatorSettingVal && seperatorSettingVal !== 'none') {
					$('#chatroom').addClass(`ntv__seperators-${seperatorSettingVal}`)
				}

				// Render emotes in chat when providers are loaded
				eventBus.subscribe('ntv.providers.loaded', this.renderChatMessages.bind(this), true)

				this.observeChatMessages()
				this.loadScrollingBehaviour()
			})
			.catch(() => {})

		// Inject or send emote to chat on emote click
		eventBus.subscribe(
			'ntv.ui.emote.click',
			({ emoteHid, sendImmediately }: { emoteHid: string; sendImmediately?: boolean }) => {
				if (sendImmediately) {
					this.sendEmoteToChat(emoteHid)
				} else {
					this.insertEmoteInChat(emoteHid)
				}
			}
		)

		// Add alternating background color to chat messages
		eventBus.subscribe('ntv.settings.change.shared.chat.appearance.alternating_background', (value: boolean) => {
			$('#chatroom').toggleClass('ntv__alternating-background', value)
		})

		// Add seperator lines to chat messages
		eventBus.subscribe(
			'ntv.settings.change.shared.chat.appearance.seperators',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				if (prevValue !== 'none') $('#chatroom').removeClass(`ntv__seperators-${prevValue}`)
				if (!value || value === 'none') return
				$('#chatroom').addClass(`ntv__seperators-${value}`)
			}
		)

		// On sigterm signal, cleanup user interface
		eventBus.subscribe('ntv.session.destroy', this.destroy.bind(this))
	}

	async loadEmoteMenu() {
		const { channelData, eventBus, settingsManager, emotesManager } = this
		if (!this.elm.$textField) return error('Text field not loaded for emote menu')

		const container = this.elm.$textField.parent().parent()[0]
		this.emoteMenu = new EmoteMenuComponent(
			{ channelData, eventBus, emotesManager, settingsManager },
			container
		).init()

		this.elm.$textField.on('click', this.emoteMenu.toggleShow.bind(this.emoteMenu, false))
	}

	async loadEmoteMenuButton() {
		const { ENV_VARS, eventBus, settingsManager } = this
		this.emoteMenuButton = new EmoteMenuButtonComponent({ ENV_VARS, eventBus, settingsManager }).init()
	}

	async loadQuickEmotesHolder() {
		const { eventBus, settingsManager, emotesManager } = this
		this.quickEmotesHolder = new QuickEmotesHolderComponent({ eventBus, settingsManager, emotesManager }).init()
	}

	loadShadowProxySubmitButton() {
		const $originalSubmitButton = (this.elm.$originalSubmitButton = $('#chatroom-footer button.base-button'))
		const $submitButton = (this.elm.$submitButton = $(`<button class="ntv__submit-button disabled">Chat</button>`))
		$originalSubmitButton.after($submitButton)

		$submitButton.on('click' as any, this.submitInput.bind(this, false))
	}

	loadShadowProxyTextField() {
		const $originalTextField = (this.elm.$originalTextField = $('#message-input'))
		const placeholder = $originalTextField.data('placeholder')
		const $textField = (this.elm.$textField = $(
			`<div id="ntv__message-input" tabindex="0" contenteditable="true" spellcheck="false" placeholder="${placeholder}"></div>`
		))
		const originalTextFieldEl = $originalTextField[0]
		const textFieldEl = $textField[0]

		const $textFieldWrapper = $(`<div class="ntv__message-input__wrapper"></div>`)
		$textFieldWrapper.append($textField)
		$originalTextField.parent().parent().append($textFieldWrapper)

		const inputController = (this.inputController = new InputController(textFieldEl))
		inputController.attachEventListeners()

		// Shift focus to shadow text field when original text field is focused
		originalTextFieldEl.addEventListener('focus', () => textFieldEl.focus(), { passive: true })

		textFieldEl.addEventListener(
			'input',
			evt => {
				const $submitButton = this.elm.$submitButton
				if (!$submitButton) return

				// Enable/disable submit button based on text field content
				if (textFieldEl.children.length && textFieldEl.children[0]?.tagName !== 'BR') {
					$submitButton.removeClass('disabled')
				} else if (!$submitButton.hasClass('disabled')) {
					$submitButton.addClass('disabled')
				}
			},
			{ passive: true }
		)

		textFieldEl.addEventListener('keydown', evt => {
			if (evt.key === 'Enter' && !this.tabCompletor?.isShowingModal) {
				evt.preventDefault()
				this.submitInput()
			}

			// inputController.handleKeydown(evt)
		})

		textFieldEl.addEventListener(
			'keyup',
			evt => {
				$originalTextField[0].innerHTML = textFieldEl.innerHTML
				// $originalTextField[0].dispatchEvent(new Event('input')) // This breaks kick emotes for some reason

				// Contenteditable is a nightmare in Firefox, keeps injecting <br> tags
				//  best solution I found yet, is to use :before to prevent collapse
				//  but now the caret gets placed after the :before pseudo element..
				//  Also bugs in Firefox keep causing the caret to shift outside the text field.
				if (textFieldEl.children.length === 1 && textFieldEl.children[0].tagName === 'BR') {
					textFieldEl.children[0].remove()
					textFieldEl.normalize()
				}

				if (evt.keyCode > 47 && evt.keyCode < 112) {
					// Typing any non-whitespace character means you commit to the selected history entry, so we reset the cursor
					this.messageHistory.resetCursor()
				}
			},
			{ passive: true }
		)

		const clipboard = new Clipboard2()
		textFieldEl.addEventListener('paste', evt => {
			evt.preventDefault()

			const messageParts = clipboard.parsePastedMessage(evt)
			if (!messageParts || !messageParts.length) return

			error('NOT IMPLEMENTED, FIX THIS')
			throw new Error('NOT IMPLEMENTED, FIX THIS')
			// TODO FIX THIS
			// for (let i = 0; i < messageParts.length; i++) {
			// 	messageParts[i] = this.renderEmotesInElement(messageParts[i])
			// }

			// clipboard.pasteHTML(messageParts.join(''))

			// if (textFieldEl.childNodes.length) {
			// 	this.elm.$submitButton?.removeClass('disabled')
			// }
		})

		// Ignore control keys that are not used for typing
		const ignoredKeys: { [key: string]: boolean } = {
			ArrowUp: true,
			ArrowDown: true,
			ArrowLeft: true,
			ArrowRight: true,
			Control: true,
			Shift: true,
			Alt: true,
			Meta: true,
			Home: true,
			End: true,
			PageUp: true,
			PageDown: true,
			Insert: true,
			Delete: true,
			Tab: true,
			Escape: true,
			Enter: true,
			Backspace: true,
			CapsLock: true,
			ContextMenu: true,
			F1: true,
			F2: true,
			F3: true,
			F4: true,
			F5: true,
			F6: true,
			F7: true,
			F8: true,
			F9: true,
			F10: true,
			F11: true,
			F12: true,
			PrintScreen: true,
			ScrollLock: true,
			Pause: true,
			NumLock: true
		}

		// If started typing with focus not on chat input, focus on chat input
		$(document.body).on('keydown', evt => {
			if (
				evt.ctrlKey ||
				evt.altKey ||
				evt.metaKey ||
				this.tabCompletor?.isShowingModal ||
				ignoredKeys[evt.key] ||
				document.activeElement?.tagName === 'INPUT' ||
				document.activeElement?.getAttribute('contenteditable')
			) {
				return
			}

			textFieldEl.focus()
		})
	}

	loadChatHistoryBehaviour() {
		const { settingsManager } = this
		if (!settingsManager.getSetting('shared.chat.input.history.enable')) return

		const $textField = this.elm.$textField
		if (!$textField) return error('Text field not loaded for chat history')

		const textFieldEl = $textField[0]

		textFieldEl.addEventListener('keydown', evt => {
			if (this.tabCompletor?.isShowingModal) return

			if (evt.key === 'ArrowUp' || evt.key === 'ArrowDown') {
				// Check if caret is at the start of the text field
				if (Caret.isCaretAtStartOfNode(textFieldEl) && evt.key === 'ArrowUp') {
					evt.preventDefault()

					if (!this.messageHistory.canMoveCursor(1)) return

					// Store leftover html in case history traversal was accidental
					const leftoverHTML = textFieldEl.innerHTML
					if (this.messageHistory.isCursorAtStart() && leftoverHTML) {
						this.messageHistory.addMessage(leftoverHTML)
						this.messageHistory.moveCursor(2)
					} else {
						this.messageHistory.moveCursor(1)
					}

					textFieldEl.innerHTML = this.messageHistory.getMessage()
				} else if (Caret.isCaretAtEndOfNode(textFieldEl) && evt.key === 'ArrowDown') {
					evt.preventDefault()

					// Reached most recent message traversing down history
					if (this.messageHistory.canMoveCursor(-1)) {
						this.messageHistory.moveCursor(-1)
						textFieldEl.innerHTML = this.messageHistory.getMessage()
					} else {
						// Store leftover html in case history traversal was accidental
						const leftoverHTML = textFieldEl.innerHTML
						if (leftoverHTML) this.messageHistory.addMessage(leftoverHTML)

						// Moved past most recent message, empty text field
						this.messageHistory.resetCursor()
						textFieldEl.innerHTML = ''
					}
				}
			}
		})
	}

	loadTabCompletionBehaviour() {
		const { emotesManager, usersManager } = this

		const $textField = this.elm.$textField
		if (!$textField) return error('Text field not loaded for chat history')
		const textFieldEl = $textField[0]

		const tabCompletor = (this.tabCompletor = new TabCompletor({ emotesManager, usersManager }))
		tabCompletor.createModal($textField.parent().parent()[0])

		textFieldEl.addEventListener('keydown', tabCompletor.handleKeydown.bind(tabCompletor))

		textFieldEl.addEventListener('keyup', evt => {
			if (this.tabCompletor?.isShowingModal) {
				if (
					(!textFieldEl.textContent || textFieldEl.textContent.trim() === '') &&
					!textFieldEl.childNodes.length
				) {
					tabCompletor.reset()
				}
			}
		})

		// Hide tab completion modal when clicking outside of it by calling tabCompletor.reset()
		document.addEventListener('click', evt => {
			if (!evt.target) return
			const isClickInsideModal = tabCompletor.isClickInsideModal(evt.target as Node)
			if (!isClickInsideModal) tabCompletor.reset()
		})
	}

	loadScrollingBehaviour() {
		const $chatMessagesContainer = this.elm.$chatMessagesContainer
		if (!$chatMessagesContainer) return error('Chat messages container not loaded for scrolling behaviour')

		// Scroll is sticky by default
		if (this.stickyScroll) $chatMessagesContainer.parent().addClass('ntv__sticky-scroll')

		// Enable sticky scroll when user scrolls to bottom
		$chatMessagesContainer[0].addEventListener(
			'scroll',
			evt => {
				if (!this.stickyScroll) {
					// Calculate if user has scrolled to bottom and set sticky scroll to true
					const target = evt.target as HTMLElement
					const isAtBottom = (target.scrollHeight || 0) - target.scrollTop <= target.clientHeight + 15

					if (isAtBottom) {
						$chatMessagesContainer.parent().addClass('ntv__sticky-scroll')
						target.scrollTop = 99999
						this.stickyScroll = true
					}
				}
			},
			{ passive: true }
		)

		// Disable sticky scroll when user scrolls up
		$chatMessagesContainer[0].addEventListener(
			'wheel',
			evt => {
				if (this.stickyScroll && evt.deltaY < 0) {
					$chatMessagesContainer.parent().removeClass('ntv__sticky-scroll')
					this.stickyScroll = false
				}
			},
			{ passive: true }
		)
	}

	observeChatMessages() {
		const $chatMessagesContainer = this.elm.$chatMessagesContainer
		if (!$chatMessagesContainer) return error('Chat messages container not loaded for observing')
		const chatMessagesContainerEl = $chatMessagesContainer[0]

		const scrollToBottom = () => (chatMessagesContainerEl.scrollTop = 99999)

		this.eventBus.subscribe('ntv.providers.loaded', () => {
			// Render emotes in chat when new messages are added
			const observer = (this.chatObserver = new MutationObserver(mutations => {
				mutations.forEach(mutation => {
					if (mutation.addedNodes.length) {
						for (const messageNode of mutation.addedNodes) {
							if (messageNode instanceof HTMLElement) {
								this.renderChatMessage(messageNode)
							}
						}
						if (this.stickyScroll) {
							// We need to wait for the next frame paint call to render before scrolling to bottom
							window.requestAnimationFrame(scrollToBottom)
						}
					}
				})
			}))
			observer.observe(chatMessagesContainerEl, { childList: true })
		})

		// Show emote tooltip with emote name, remove when mouse leaves
		const showTooltips = this.settingsManager.getSetting('shared.chat.tooltips.images')
		$chatMessagesContainer.on('mouseover', '.ntv__emote-box img', evt => {
			const emoteName = evt.target.dataset.emoteName
			const emoteHid = evt.target.dataset.emoteHid
			if (!emoteName || !emoteHid) return

			const target = evt.target
			const $tooltip = $(
				cleanupHTML(`
					<div class="ntv__emote-tooltip ${showTooltips ? 'ntv__emote-tooltip--has-image' : ''}">
						${showTooltips ? target.outerHTML.replace('chat-emote', '') : ''}
						<span>${emoteName}</span>
					</div>`)
			)

			$(target).after($tooltip)

			evt.target.addEventListener(
				'mouseleave',
				() => {
					$tooltip.remove()
				},
				{ once: true, passive: true }
			)
		})

		// Insert emote in chat input when clicked
		// Can't track click events on kick emotes, because they kill the even with stopPropagation()
		$chatMessagesContainer.on('click', '.ntv__emote-box img', evt => {
			const emoteHid = evt.target.dataset.emoteHid
			if (!emoteHid) return
			this.insertEmoteInChat(emoteHid)
		})
	}

	renderChatMessages() {
		if (!this.elm || !this.elm.$chatMessagesContainer) return
		const chatMessagesContainerEl = this.elm.$chatMessagesContainer[0]
		const chatMessagesContainerNode = chatMessagesContainerEl

		for (const messageNode of chatMessagesContainerNode.children) {
			this.renderChatMessage(messageNode as HTMLElement)
		}
	}

	renderChatMessage(messageNode: HTMLElement) {
		const usernameEl = messageNode.querySelector('.chat-entry-username') as HTMLElement
		if (usernameEl) {
			const { chatEntryUser, chatEntryUserId } = usernameEl.dataset
			const chatEntryUserName = usernameEl.textContent
			if (chatEntryUserId && chatEntryUserName) {
				this.usersManager.registerUser(chatEntryUserId, chatEntryUserName)
			}
		}

		/*
			Kick chat message structure:
			<div data-chat-entry="...">
				<div class="chat-entry">
					<div> <---|| Useless wrapper node ||
						<span class="chat-message-identity">Foobar</span>
						<span class="font-bold text-white">: </span>
						<span> <---|| The content nodes start here ||
							<span class="chat-entry-content"> <---|| Chat message components (text component) ||
								Foobar
							</div>
						</span>
						<span>
							<div class="chat-emote-container"> <---|| Chat message components (emote component) ||
								<div class="relative">
									<img>
								</div>
							</div>
						</span>
					</div>
				</div>
			</div>

			We unpack the chat message components and render them in our format:
			<div data-chat-entry="...">
				<div class="chat-entry"> <---|| Can't get rid of this, because Kick hooks into it with buttons ||
					<div class="ntv__chat-message">
						<span class="ntv__chat-message__part">Foobar</span>
						<span class="ntv__chat-message__part ntv__inline-emote-box">
							<img>
						</span>
					</div>
				</div>
			</div>
		*/

		const chatEntryNode = messageNode.children[0]
		const uselessWrapperNode = chatEntryNode.children[0]
		const contentNodes = Array.from(uselessWrapperNode.children)
		const contentNodesLength = contentNodes.length

		// We remove the useless wrapper node because we unpack it's contents to parent
		uselessWrapperNode.remove()

		// Find index of first content node after username etc
		let firstContentNodeIndex = 0
		for (let i = 0; i < contentNodes.length; i++) {
			if (contentNodes[i].textContent === ': ') {
				firstContentNodeIndex = i + 1
				break
			}
		}

		// Append username etc nodes to chat entry node
		for (let i = 0; i < firstContentNodeIndex; i++) {
			chatEntryNode.appendChild(contentNodes[i])
		}

		// Chat message after username is empty..
		if (!contentNodes[firstContentNodeIndex]) return

		// Skip first two nodes, they are the username etc
		for (let i = firstContentNodeIndex; i < contentNodesLength; i++) {
			const contentNode = contentNodes[i]
			const componentNode = contentNode.children[0] // Either text or emote component
			if (!componentNode) {
				log('Chat message component node not found. Are chat messages being rendered twice?', contentNode)
				continue
			}

			// We extract and flatten the Kick components to our format
			switch (componentNode.className) {
				case 'chat-entry-content':
					if (!componentNode.textContent) continue
					if (!(componentNode instanceof Element)) {
						error('Chat message content node not an Element?', componentNode)
						continue
					}
					this.renderEmotesInElement(componentNode, chatEntryNode)
					break

				case 'chat-emote-container':
					// Unwrap and clean up native Kick emotes
					const imgEl = componentNode.querySelector('img')
					if (!imgEl) continue
					imgEl.removeAttribute('class')
					for (const attr in imgEl.dataset) {
						if (attr.startsWith('v-')) {
							imgEl.removeAttribute('data-' + attr)
						}
					}

					const newContentNode = document.createElement('span')
					newContentNode.classList.add('ntv__chat-message__part', 'ntv__inline-emote-box')
					newContentNode.setAttribute('contenteditable', 'false')
					newContentNode.appendChild(imgEl)
					chatEntryNode.appendChild(newContentNode)
					break
			}
		}

		// Adding this class removes the display: none from the chat message, causing a reflow
		messageNode.classList.add('ntv__chat-message')
	}

	// Submits input to chat
	submitInput(suppressEngagementEvent = false) {
		const { eventBus, emotesManager } = this

		if (!this.elm.$textField || !this.elm.$originalTextField || !this.elm.$originalSubmitButton) {
			return error('Text field not loaded for submitting input')
		}

		const originalTextFieldEl = this.elm.$originalTextField[0]
		const originalSubmitButtonEl = this.elm.$originalSubmitButton[0]
		const textFieldEl = this.elm.$textField[0]

		let parsedString = ''
		let emotesInMessage = new Set()
		let emoteFlag = false
		for (const node of textFieldEl.childNodes) {
			if (node.nodeType === Node.TEXT_NODE) {
				log(`TEXT "${node.textContent}"`)
				parsedString += node.textContent
				emoteFlag = false
			} else if (node.nodeType === Node.ELEMENT_NODE) {
				const componentBody = node.childNodes[1]
				const emoteBox = componentBody.childNodes[0]

				if (emoteBox) {
					const emoteHid = (emoteBox as HTMLElement).dataset.emoteHid

					if (emoteHid) {
						emotesInMessage.add(emoteHid)
						// const spacingBefore = parsedString[parsedString.length - 1] !== ' '
						const spacingBefore = !emoteFlag ? ' ' : ''
						parsedString += spacingBefore + emotesManager.getEmoteEmbeddable(emoteHid) + ' '
					}

					emoteFlag = true
				} else {
					error('Invalid component node', componentBody.childNodes)
				}
			}
		}

		if (parsedString.length > this.maxMessageLength) {
			error(
				`Message too long, it is ${parsedString.length} characters but max limit is ${this.maxMessageLength}.`
			)
			return
		}

		if (!suppressEngagementEvent) {
			for (const emoteHid of emotesInMessage) {
				emotesManager.registerEmoteEngagement(emoteHid as string)
			}
		}

		originalTextFieldEl.innerHTML = parsedString

		this.messageHistory.addMessage(textFieldEl.innerHTML)
		this.messageHistory.resetCursor()

		textFieldEl.innerHTML = ''

		originalSubmitButtonEl.dispatchEvent(new Event('click'))

		// Trigger input event to update submit button disabled state
		textFieldEl.dispatchEvent(new Event('input'))

		eventBus.publish('ntv.ui.submit_input')
	}

	// Sends emote to chat and restores previous message
	sendEmoteToChat(emoteHid: string) {
		assertArgDefined(emoteHid)

		if (!this.elm.$textField || !this.elm.$originalTextField || !this.elm.$submitButton) {
			return error('Text field not loaded for sending emote')
		}

		const originalTextFieldEl = this.elm.$originalTextField[0]
		const textFieldEl = this.elm.$textField[0]

		const oldMessage = textFieldEl.innerHTML
		textFieldEl.innerHTML = ''

		this.insertEmoteInChat(emoteHid)
		this.submitInput(true)

		textFieldEl.innerHTML = oldMessage
		originalTextFieldEl.innerHTML = oldMessage
		originalTextFieldEl.dispatchEvent(new Event('input'))

		if (oldMessage) {
			this.elm.$submitButton.removeAttr('disabled')
		}
	}

	insertEmoteInChat(emoteHid: string) {
		assertArgDefined(emoteHid)
		const { emotesManager, inputController } = this

		if (!inputController) return error('Text editor not loaded yet for emote insertion')

		// Inserting emote means you chose the history entry, so we reset the cursor
		this.messageHistory.resetCursor()

		const emoteHTML = emotesManager.getRenderableEmoteByHid(emoteHid)
		if (!emoteHTML) return error('Invalid emote embed')

		const component = document.createElement('span')
		component.className = 'ntv__input-component'
		component.appendChild(document.createTextNode('\u200B'))
		const componentBody = document.createElement('span')
		componentBody.className = 'ntv__input-component__body'
		componentBody.setAttribute('contenteditable', 'false')
		componentBody.appendChild(
			(
				jQuery.parseHTML(
					`<span class="ntv__inline-emote-box" data-emote-hid="${emoteHid}" contenteditable="false">` +
						emoteHTML +
						'</span>'
				) as Element[]
			)[0]
		)
		component.appendChild(componentBody)
		component.appendChild(document.createTextNode('\u200B'))

		// inputController.deleteSelectionContents()
		inputController.insertComponent(component)

		// this.insertNodesInChat(embedNodes)
		this.elm.$submitButton?.removeAttr('disabled')

		// Update original text field to match the shadow text field
		if (!this.elm.$originalTextField) return error('Original text field not loaded for emote insertion')
		this.elm.$originalTextField.html(this.elm.$textField?.html() || '')
	}

	insertNodesInChat(embedNodes: Node[]) {
		if (!embedNodes.length) return error('No nodes to insert in chat')

		const $textField = this.elm.$textField
		if (!$textField) return error('Text field not loaded for inserting node')
		const textFieldEl = $textField[0]

		const selection = window.getSelection()
		if (selection && selection.rangeCount) {
			const range = selection.getRangeAt(0)
			const caretIsInTextField =
				range.commonAncestorContainer === textFieldEl ||
				range.commonAncestorContainer?.parentElement === textFieldEl

			if (caretIsInTextField) {
				range.deleteContents()
				for (const node of embedNodes) {
					range.insertNode(node)
				}
				selection.collapseToEnd()
			} else {
				textFieldEl.append(...embedNodes)
			}
		} else {
			textFieldEl.append(...embedNodes)
		}

		textFieldEl.normalize()
		textFieldEl.dispatchEvent(new Event('input'))
		textFieldEl.focus()
	}

	insertNodeInChat(embedNode: Node) {
		if (embedNode.nodeType !== Node.TEXT_NODE && embedNode.nodeType !== Node.ELEMENT_NODE) {
			return error('Invalid node type', embedNode)
		}

		const $textField = this.elm.$textField
		if (!$textField) return error('Text field not loaded for inserting node')
		const textFieldEl = $textField[0]

		const selection = window.getSelection()
		const range = selection?.anchorNode ? selection.getRangeAt(0) : null

		if (range) {
			const caretIsInTextField =
				range.commonAncestorContainer === textFieldEl ||
				range.commonAncestorContainer?.parentElement === textFieldEl

			if (caretIsInTextField) {
				Caret.insertNodeAtCaret(range, embedNode)
			}

			// Caret is not in text field, just append node to end of text field
			else {
				textFieldEl.appendChild(embedNode)
			}

			Caret.collapseToEndOfNode(embedNode)
		}

		// If no range, just append node to end of text field
		else {
			textFieldEl.appendChild(embedNode)
		}

		// Normalize text nodes to merge adjecent text nodes
		textFieldEl.normalize()
		textFieldEl.dispatchEvent(new Event('input'))
		textFieldEl.focus()

		// Manually merge adjecent text nodes
		// let currentMergingTextNode = null
		// for (let i=0; i<textFieldEl.childNodes.length; i++) {
		//     const node = textFieldEl.childNodes[i]
		//     if (node.nodeType === Node.TEXT_NODE) {
		//         if (!currentMergingTextNode) {
		//             currentMergingTextNode = node
		//             continue
		//         }
		//
		//         currentMergingTextNode.textContent += node.textContent
		//         node.remove()
		//         i--;
		//     }
		//     currentMergingTextNode = null
		// }
	}

	destroy() {
		if (this.abortController) this.abortController.abort()
		if (this.chatObserver) this.chatObserver.disconnect()
		if (this.emoteMenu) this.emoteMenu.destroy()
		if (this.emoteMenuButton) this.emoteMenuButton.destroy()
		if (this.quickEmotesHolder) this.quickEmotesHolder.destroy()
	}
}
