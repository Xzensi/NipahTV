import { log, error, assertArgDefined, CHAR_ZWSP, debounce, eventKeyIsLetterDigitPuncSpaceChar } from '../utils'
import { PriorityEventTarget } from './PriorityEventTarget'
import MessagesHistory from './MessagesHistory'
import { Caret } from '../UserInterface/Caret'
import { U_TAG_NTV_AFFIX } from '../constants'
import Clipboard2 from './Clipboard'

/**
 * Inserts a space character before the component if there is no space character before it.
 * Does not insert a space character if the component is the first child of the input node.
 * @param component
 */
function maybeInsertSpaceCharacterBeforeComponent(component: HTMLElement) {
	const prevSibling = component.previousSibling
	if (prevSibling && prevSibling.nodeType === Node.TEXT_NODE) {
		const textNode = prevSibling as Text
		const textContent = textNode.textContent
		if (textContent === null) {
			component.before(document.createTextNode(' '))
		} else if (textContent[textContent.length - 1] !== ' ') {
			textNode.textContent += ' '
		}
	} else if (prevSibling && prevSibling.nodeType === Node.ELEMENT_NODE) {
		component.before(document.createTextNode(' '))
	}
}

/**
 * Inserts a space character after the component if there is no space character after it.
 * Always inserts a space character if the component is the last child of the input node.
 * @param component
 */
function maybeInsertSpaceCharacterAfterComponent(component: HTMLElement) {
	const nextSibling = component.nextSibling
	if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
		const textNode = nextSibling as Text
		const textContent = textNode.textContent
		if (textContent === null) {
			component.after(document.createTextNode(' '))
		} else if (textContent[0] !== ' ') {
			textNode.textContent = ' ' + textContent
		}
	} else if (nextSibling && nextSibling.nodeType === Node.ELEMENT_NODE) {
		component.after(document.createTextNode(' '))
	} else {
		component.after(document.createTextNode(' '))
	}
}

export class ContentEditableEditor {
	private rootContext: RootContext
	private session: Session
	private messageHistory: MessagesHistory
	private clipboard: Clipboard2
	private inputNode: HTMLElement
	private eventTarget = new PriorityEventTarget()
	private processInputContentDebounce: () => void
	private inputEmpty = true
	private isInputEnabled = true
	private characterCount = 0
	private messageContent = ''
	private emotesInMessage: Set<string> = new Set()
	private hasMouseDown = false
	private hasUnprocessedContentChanges = false

	constructor(
		rootContext: RootContext,
		session: Session,
		{
			messageHistory,
			clipboard
		}: {
			messageHistory: MessagesHistory
			clipboard: Clipboard2
		},
		contentEditableEl: HTMLElement
	) {
		this.rootContext = rootContext
		this.session = session
		this.messageHistory = messageHistory
		this.clipboard = clipboard
		this.inputNode = contentEditableEl satisfies ElementContentEditable

		this.processInputContentDebounce = debounce(this.processInputContent.bind(this), 25)
	}

	destroy() {
		if (this.inputNode) this.inputNode.remove()
	}

	getInputNode() {
		return this.inputNode
	}

	getCharacterCount() {
		return this.characterCount
	}

	getFirstCharacter() {
		const firstChild = this.inputNode.firstChild
		if (firstChild instanceof Text) return firstChild.data[0]
		return null
	}

	getMessageContent() {
		this.processInputContent()
		return this.messageContent
	}

	getInputHTML() {
		return this.inputNode.innerHTML
	}

	getEmotesInMessage() {
		return this.emotesInMessage
	}

	setPlaceholder(placeholder?: string) {
		placeholder
			? this.inputNode.setAttribute('placeholder', placeholder)
			: this.inputNode.removeAttribute('placeholder')
	}

	isInputEmpty() {
		return this.inputEmpty
	}

	clearInput() {
		while (this.inputNode.firstChild) this.inputNode.removeChild(this.inputNode.firstChild)
		this.hasUnprocessedContentChanges = true
		this.processInputContent()
	}

	enableInput() {
		this.inputNode.setAttribute('contenteditable', 'true')
		this.isInputEnabled = true
	}

	disableInput() {
		this.inputNode.setAttribute('contenteditable', 'false')
		this.isInputEnabled = false
	}

	isEnabled() {
		return this.isInputEnabled
	}

	isClickEventInInput(event: MouseEvent) {
		return this.inputNode.contains(event.target as Node)
	}

	addEventListener(
		type: string,
		priority: number,
		listener: (event: any) => void,
		options?: AddEventListenerOptions
	) {
		this.eventTarget.addEventListener(type, priority, listener, options)
	}

	forwardEvent(event: Event) {
		this.eventTarget.dispatchEvent(event)
	}

	attachEventListeners() {
		const { emotesManager } = this.session
		const { inputNode, clipboard } = this

		// inputNode.addEventListener('selectstart', (evt: Event) => {
		// 	const selection = (evt.target as any)?.value
		// 	log('SelectStart', selection)
		// })

		document.addEventListener('selectionchange', (evt: Event) => {
			const activeElement = document.activeElement
			if (activeElement !== inputNode) return

			this.adjustSelection()
		})

		inputNode.addEventListener('paste', evt => {
			evt.preventDefault()

			const messageParts = clipboard.parsePastedMessage(evt)
			if (!messageParts.length) return

			// Remove reserved Unicode range U+E0001 to U+E007F. These are used for internal tag characters.
			for (let i = 0; i < messageParts.length; i++) {
				messageParts[i] = messageParts[i].replace(/[\u{E0001}-\u{E007F}]/gu, '')
			}

			const newNodes = []
			for (let i = 0; i < messageParts.length; i++) {
				const tokens = messageParts[i].split(' ')

				for (let j = 0; j < tokens.length; j++) {
					const token = tokens[j]
					const emoteHid = emotesManager.getEmoteHidByName(token)
					if (emoteHid) {
						newNodes.push(
							this.createEmoteComponent(emoteHid, emotesManager.getRenderableEmoteByHid(emoteHid)!)
						)
					} else if (i === 0 && j === 0) {
						newNodes.push(document.createTextNode(token))
					} else {
						if (newNodes[newNodes.length - 1] instanceof Text) {
							newNodes[newNodes.length - 1].textContent += ' ' + token
						} else {
							newNodes.push(document.createTextNode(token))
						}
					}
				}
			}

			this.insertNodes(newNodes)
			this.processInputContent()

			const isNotEmpty = inputNode.childNodes.length && (inputNode.childNodes[0] as HTMLElement)?.tagName !== 'BR'
			if (this.inputEmpty && isNotEmpty) {
				this.inputEmpty = isNotEmpty
				this.eventTarget.dispatchEvent(new CustomEvent('is_empty', { detail: { isEmpty: !isNotEmpty } }))
			}
		})

		// Hook the event into a PriorityTargetEvent so that it can handle stopPropagation calls
		//  for callbacks that want to intercept and cancel the event.
		this.eventTarget.addEventListener('keydown', 10, this.handleKeydown.bind(this))
		inputNode.addEventListener('keydown', this.eventTarget.dispatchEvent.bind(this.eventTarget))
		this.eventTarget.addEventListener('keyup', 10, this.handleKeyUp.bind(this))
		inputNode.addEventListener('keyup', this.eventTarget.dispatchEvent.bind(this.eventTarget))

		inputNode.addEventListener('mousedown', this.handleMouseDown.bind(this))
		inputNode.addEventListener('mouseup', this.handleMouseUp.bind(this))
	}

	handleKeydown(event: KeyboardEvent) {
		if (event.ctrlKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
			return this.handleCtrlArrowKeyDown(event)
		}

		if (!this.isInputEnabled) {
			event.preventDefault()
			return
		}

		switch (event.key) {
			case 'Backspace':
				this.deleteBackwards(event)
				break

			case 'Delete':
				this.deleteForwards(event)
				break

			case 'Enter':
				event.preventDefault()
				event.stopImmediatePropagation()
				if (!this.inputEmpty) {
					this.session.eventBus.publish('ntv.input_controller.submit', {
						dontClearInput: event.ctrlKey
					})
				}
				break

			case 'Tab':
				event.preventDefault()
				break

			case ' ': // Space character key
				this.handleSpaceKey(event)
				break

			default:
				if (eventKeyIsLetterDigitPuncSpaceChar(event)) {
					event.preventDefault()
					this.insertText(event.key)
				}
		}
	}

	handleMouseDown(event: MouseEvent) {
		this.hasMouseDown = true
	}

	handleMouseUp(event: MouseEvent) {
		this.hasMouseDown = false
	}

	handleKeyUp(event: KeyboardEvent) {
		const { inputNode } = this

		if (!this.isInputEnabled) {
			event.preventDefault()
			return
		}

		// Contenteditable is a nightmare in Firefox, keeps injecting <br> tags.
		//  Best solution I found yet, is to use :before to prevent collapse
		//  but now the caret gets placed after the :before pseudo element..
		//  Also bugs in Firefox keep causing the caret to shift outside the text field.
		if (inputNode.children.length === 1 && inputNode.children[0].tagName === 'BR') {
			inputNode.children[0].remove()
		}

		// TODO fix it properly so this is not necessary
		if (event.key === 'Backspace' || event.key === 'Delete') {
			// Ctrl backspace/delete can sometimes (seemingly?) skip over components leaving them as partially empty/corrupt component nodes.
			//  We do a fast pass check for empty component nodes and clean them up.
			this.normalizeComponents()
		}

		const isNotEmpty = inputNode.childNodes.length && (inputNode.childNodes[0] as HTMLElement)?.tagName !== 'BR'

		if (this.hasUnprocessedContentChanges) {
			if (isNotEmpty) {
				this.processInputContentDebounce()
			} else {
				this.processInputContent()
			}
		}

		if (this.inputEmpty === !isNotEmpty) return
		this.inputEmpty = !this.inputEmpty
		this.eventTarget.dispatchEvent(new CustomEvent('is_empty', { detail: { isEmpty: !isNotEmpty } }))
	}

	handleSpaceKey(event: KeyboardEvent) {
		const { inputNode } = this

		if (!this.isInputEnabled) {
			event.preventDefault()
			return
		}

		const selection = document.getSelection()
		if (!selection || !selection.rangeCount) return

		const { focusNode } = selection
		if (focusNode?.parentElement?.classList.contains('ntv__input-component')) {
			event.preventDefault()
			this.hasUnprocessedContentChanges = true
			return this.insertText(' ')
		}

		const { word, start, end, node } = Caret.getWordBeforeCaret()
		if (!word) {
			event.preventDefault()
			return this.insertText(' ')
		}

		const emoteHid = this.session.emotesManager.getEmoteHidByName(word)
		if (!emoteHid) {
			event.preventDefault()
			return this.insertText(' ')
		}

		const textContent = node.textContent
		if (!textContent) {
			event.preventDefault()
			return this.insertText(' ')
		}

		node.textContent = textContent.slice(0, start) + textContent.slice(end)
		inputNode.normalize()
		// Caret.replaceTextInRange(node, start, start, '')
		selection?.setPosition(node, start)
		this.insertEmote(emoteHid)

		event.preventDefault()
		this.hasUnprocessedContentChanges = true
	}

	handleCtrlArrowKeyDown(event: KeyboardEvent) {
		event.preventDefault()

		const selection = document.getSelection()
		if (!selection || !selection.rangeCount) return

		const { focusNode, focusOffset } = selection
		const { inputNode } = this
		const direction = event.key === 'ArrowRight'

		const isFocusInComponent = selection.focusNode?.parentElement?.classList.contains('ntv__input-component')

		// NOTE: selection.modify() will trigger selectionchange event, so no need for `this.adjustSelection()`

		if (isFocusInComponent) {
			const component = focusNode!.parentElement as HTMLElement
			const isRightSideOfComp = !focusNode!.nextSibling

			if ((!isRightSideOfComp && direction) || (isRightSideOfComp && !direction)) {
				event.shiftKey
					? selection.modify('extend', direction ? 'forward' : 'backward', 'character')
					: selection.modify('move', direction ? 'forward' : 'backward', 'character')
			} else if (isRightSideOfComp && direction) {
				if (component.nextSibling instanceof Text) {
					event.shiftKey
						? selection.extend(component.nextSibling, component.nextSibling.textContent?.length || 0)
						: selection.setPosition(component.nextSibling, component.nextSibling.textContent?.length || 0)
				} else if (
					component.nextSibling instanceof HTMLElement &&
					component.nextSibling.classList.contains('ntv__input-component')
				) {
					event.shiftKey
						? selection.extend(component.nextSibling.childNodes[2], 1)
						: selection.setPosition(component.nextSibling.childNodes[2], 1)
				}
			} else if (!isRightSideOfComp && !direction) {
				if (component.previousSibling instanceof Text) {
					event.shiftKey
						? selection.extend(component.previousSibling, 0)
						: selection.setPosition(component.previousSibling, 0)
				} else if (
					component.previousSibling instanceof HTMLElement &&
					component.previousSibling.classList.contains('ntv__input-component')
				) {
					event.shiftKey
						? selection.extend(component.previousSibling.childNodes[0], 0)
						: selection.setPosition(component.previousSibling.childNodes[0], 0)
				}
			}
		} else if (focusNode instanceof Text) {
			if (direction) {
				if (focusOffset === focusNode.textContent?.length) {
					event.shiftKey
						? selection.modify('extend', 'forward', 'character')
						: selection.modify('move', 'forward', 'character')
				} else {
					let nextSpaceIndex = focusNode.textContent?.indexOf(' ', focusOffset + 1)
					if (nextSpaceIndex === -1) nextSpaceIndex = focusNode.textContent?.length

					event.shiftKey
						? selection.extend(focusNode, nextSpaceIndex || 0)
						: selection.setPosition(focusNode, nextSpaceIndex || 0)
				}
			} else {
				if (focusOffset === 0) {
					event.shiftKey
						? selection.modify('extend', 'backward', 'character')
						: selection.modify('move', 'backward', 'character')
				} else {
					let prevSpaceIndex = focusNode.textContent?.lastIndexOf(' ', focusOffset - 1)
					if (prevSpaceIndex === -1) prevSpaceIndex = 0

					event.shiftKey
						? selection.extend(focusNode, prevSpaceIndex)
						: selection.setPosition(focusNode, prevSpaceIndex)
				}
			}
		} else if (direction && inputNode.childNodes[focusOffset] instanceof Text) {
			const nodeAtOffset = inputNode.childNodes[focusOffset]
			const firstSpaceIndexInTextnode = nodeAtOffset.textContent?.indexOf(' ') || 0

			event.shiftKey
				? selection.extend(nodeAtOffset, firstSpaceIndexInTextnode)
				: selection.setPosition(nodeAtOffset, firstSpaceIndexInTextnode)
		} else if (!direction && inputNode.childNodes[focusOffset - 1] instanceof Text) {
			const nodeAtOffset = inputNode.childNodes[focusOffset - 1]
			let firstSpaceIndexInTextnode = nodeAtOffset.textContent?.lastIndexOf(' ') || -1

			if (firstSpaceIndexInTextnode === -1) firstSpaceIndexInTextnode = 0
			else firstSpaceIndexInTextnode += 1

			event.shiftKey
				? selection.extend(nodeAtOffset, firstSpaceIndexInTextnode)
				: selection.setPosition(nodeAtOffset, firstSpaceIndexInTextnode)
		} else {
			if (direction && inputNode.childNodes[focusOffset]) {
				event.shiftKey
					? selection.extend(inputNode, focusOffset + 1)
					: selection.setPosition(inputNode, focusOffset + 1)
			} else if (!direction && inputNode.childNodes[focusOffset - 1]) {
				event.shiftKey
					? selection.extend(inputNode, focusOffset - 1)
					: selection.setPosition(inputNode, focusOffset - 1)
			}
		}
	}

	normalize() {
		this.inputNode.normalize()
	}

	normalizeComponents() {
		const { inputNode } = this
		const components = inputNode.querySelectorAll('.ntv__input-component')
		for (let i = 0; i < components.length; i++) {
			const component = components[i]
			if (
				!component.childNodes[1] ||
				(component.childNodes[1] as HTMLElement).className !== 'ntv__input-component__body'
			) {
				log('!! Cleaning up empty component', component)
				component.remove()
			}
		}
	}

	createEmoteComponent(emoteHID: string, emoteHTML: string) {
		const component = document.createElement('span')
		component.className = 'ntv__input-component'
		component.appendChild(document.createTextNode(CHAR_ZWSP))
		const componentBody = document.createElement('span')
		componentBody.className = 'ntv__input-component__body'
		componentBody.setAttribute('contenteditable', 'false')
		const inlineEmoteBox = document.createElement('span')
		inlineEmoteBox.className = 'ntv__inline-emote-box'
		inlineEmoteBox.setAttribute('data-emote-hid', emoteHID)
		inlineEmoteBox.innerHTML = emoteHTML
		componentBody.appendChild(inlineEmoteBox)
		component.appendChild(componentBody)
		component.appendChild(document.createTextNode(CHAR_ZWSP))
		return component
	}

	setInputContent(content: string) {
		this.inputNode.innerHTML = content
		this.hasUnprocessedContentChanges = true
		this.processInputContent()
	}

	processInputContent() {
		if (!this.hasUnprocessedContentChanges) return

		const { eventBus, emotesManager } = this.session
		const { inputNode } = this
		const buffer = []
		let bufferString = ''
		let emotesInMessage = this.emotesInMessage
		emotesInMessage.clear()

		for (const node of inputNode.childNodes) {
			if (node.nodeType === Node.TEXT_NODE) {
				bufferString += node.textContent
			} else if (node.nodeType === Node.ELEMENT_NODE) {
				const componentBody = node.childNodes[1]
				if (!componentBody) {
					error('Invalid component node', node)
					continue
				}
				const emoteBox = componentBody.childNodes[0]

				if (emoteBox) {
					const emoteHid = (emoteBox as HTMLElement).dataset.emoteHid

					if (emoteHid) {
						if (bufferString) buffer.push(bufferString.trim())
						bufferString = ''
						emotesInMessage.add(emoteHid)
						buffer.push(emotesManager.getEmoteEmbeddable(emoteHid))
					} else {
						error('Invalid emote node, missing HID', emoteBox)
					}
				} else {
					error('Invalid component node', componentBody.childNodes)
				}
			}
		}

		if (bufferString) buffer.push(bufferString.trim())

		this.messageContent = buffer.join(' ')
		this.emotesInMessage = emotesInMessage

		this.characterCount = this.messageContent.length
		this.hasUnprocessedContentChanges = false
		eventBus.publish('ntv.input_controller.character_count', { value: this.characterCount })

		if (!inputNode.childNodes.length) eventBus.publish('ntv.input_controller.empty_input')
	}

	deleteBackwards(evt: KeyboardEvent) {
		const { inputNode } = this

		const selection = document.getSelection()
		if (!selection || !selection.rangeCount) return error('No ranges found in selection')

		const { focusNode, focusOffset } = selection
		if (focusNode === inputNode && focusOffset === 0) {
			evt.preventDefault()
			return
		}

		// TODO need to custom implement ctrl + backspace handling because browsers do not handle it well. Components sometimes somehow end up half empty with missing body.

		// if (focusNode === inputNode) {
		// 	selection.extend(inputNode, focusOffset - 1)
		// } else if (focusNode?.parentElement?.classList.contains('ntv__input-component')) {
		// 	const componentNode = focusNode.parentElement
		// 	const componentIndex = Array.from(inputNode.childNodes).indexOf(componentNode as HTMLElement)
		// 	selection.extend(inputNode, componentIndex)
		// } else if (focusOffset === 0 && focusNode?.previousSibling instanceof HTMLElement) {
		// 	const componentIndex = Array.from(inputNode.childNodes).indexOf(focusNode.previousSibling as any)
		// 	selection.extend(inputNode, componentIndex)
		// } else if (focusNode instanceof Text)

		let range = selection.getRangeAt(0)

		// Selection focus is inside component
		if (range.startContainer.parentElement?.classList.contains('ntv__input-component')) {
			this.adjustSelectionForceOutOfComponent(selection)
			range = selection.getRangeAt(0)
		}

		const { startContainer, endContainer, startOffset } = range
		const isStartContainerTheInputNode = startContainer === inputNode

		// Ensure selection does not include outside scope of input node.
		if (!isStartContainerTheInputNode && startContainer.parentElement !== inputNode) {
			// range.setStart(inputNode, 0)
			return
		}
		if (endContainer !== inputNode && endContainer.parentElement !== inputNode) {
			// range.setEnd(inputNode, inputNode.childNodes.length)
			return
		}

		const isStartInComponent =
			startContainer instanceof Element && startContainer.classList.contains('ntv__input-component')
		const prevSibling = startContainer.previousSibling

		let rangeIncludesComponent = false
		if (isStartInComponent) {
			range.setStartBefore(startContainer)
			rangeIncludesComponent = true
		} else if (startContainer instanceof Text && startOffset === 0 && prevSibling instanceof Element) {
			range.setStartBefore(prevSibling)
			rangeIncludesComponent = true
		} else if (isStartContainerTheInputNode && inputNode.childNodes[startOffset - 1] instanceof Element) {
			if (range.collapsed) range.setStartBefore(inputNode.childNodes[startOffset - 1])
			rangeIncludesComponent = true
		}

		if (rangeIncludesComponent) {
			evt.preventDefault()
			range.deleteContents()
			selection.removeAllRanges()
			selection.addRange(range)
			inputNode.normalize()
		}

		this.hasUnprocessedContentChanges = true
	}

	deleteForwards(evt: KeyboardEvent) {
		const { inputNode } = this

		const selection = document.getSelection()
		if (!selection || !selection.rangeCount) return error('No ranges found in selection')

		let range = selection.getRangeAt(0)

		// Selection focus is inside component
		this.adjustSelectionForceOutOfComponent(selection)
		range = selection.getRangeAt(0)

		const { startContainer, endContainer, collapsed, startOffset, endOffset } = range
		const isEndContainerTheInputNode = endContainer === inputNode

		// Ensure selection does not include outside scope of input node.
		if (!isEndContainerTheInputNode && endContainer.parentElement !== inputNode) {
			return
		}
		if (startContainer !== inputNode && startContainer.parentElement !== inputNode) {
			return
		}

		const isEndInComponent =
			endContainer instanceof Element && endContainer.classList.contains('ntv__input-component')
		const nextSibling = endContainer.nextSibling

		let rangeIncludesComponent = false
		if (isEndInComponent) {
			range.setEndAfter(endContainer)
			rangeIncludesComponent = true
		} else if (
			endContainer instanceof Text &&
			endOffset === endContainer.length &&
			nextSibling instanceof Element
		) {
			range.setEndAfter(nextSibling)
			rangeIncludesComponent = true
		} else if (isEndContainerTheInputNode && inputNode.childNodes[endOffset] instanceof Element) {
			if (range.collapsed) range.setEndAfter(inputNode.childNodes[endOffset])
			rangeIncludesComponent = true
		}

		if (rangeIncludesComponent) {
			evt.preventDefault()
			range.deleteContents()
			selection.removeAllRanges()
			selection.addRange(range)
			inputNode.normalize()
		}

		this.hasUnprocessedContentChanges = true
	}

	/**
	 * Adjusts the selection to ensure that the selection focus and anchor are never
	 *  inbetween a component's body and it's adjecent zero-width space text nodes.
	 */
	adjustSelection() {
		const selection = document.getSelection()
		if (!selection || !selection.rangeCount) return

		const { inputNode } = this

		// If selection focus and anchor are collapsed and caret is between component body
		//  and zero-width space, push the caret out of the component on other side.
		if (selection.isCollapsed) {
			const { startContainer, startOffset } = selection.getRangeAt(0)

			if (!startContainer.parentElement?.classList.contains('ntv__input-component')) return

			const nextSibling = startContainer.nextSibling
			const prevSibling = startContainer.previousSibling

			if (!nextSibling && startOffset === 0) {
				const prevZWSP = prevSibling?.previousSibling
				if (prevZWSP) selection.collapse(prevZWSP, 0)
			} else if (startOffset === 1) {
				const nextZWSP = nextSibling?.nextSibling
				if (nextZWSP) selection.collapse(nextZWSP, 1)
			}
		}

		// If anchor and focus are not collapsed, it means the user is trying to make a selection
		//  so we check if either focus or anchor is inside a component and force extend it out of the component.
		else {
			const { focusNode, focusOffset, anchorNode, anchorOffset } = selection
			const { hasMouseDown } = this

			const isFocusInComponent = focusNode?.parentElement?.classList.contains('ntv__input-component')
			const isAnchorInComponent = anchorNode?.parentElement?.classList.contains('ntv__input-component')

			let adjustedFocusOffset = null,
				adjustedAnchorOffset = null

			if (isFocusInComponent) {
				const componentIndex = Array.from(inputNode.childNodes).indexOf(focusNode?.parentElement as HTMLElement)
				if (focusNode?.nextSibling) {
					if (hasMouseDown) {
						adjustedFocusOffset = componentIndex
					} else {
						if (focusOffset === 0) {
							adjustedFocusOffset = componentIndex
						} else {
							adjustedFocusOffset = componentIndex + 1
						}
					}
				} else {
					if (hasMouseDown) {
						adjustedFocusOffset = componentIndex + 1
					} else {
						if (focusOffset === 0) {
							adjustedFocusOffset = componentIndex
						} else {
							adjustedFocusOffset = componentIndex + 1
						}
					}
				}
			}

			if (isAnchorInComponent) {
				const componentIndex = Array.from(inputNode.childNodes).indexOf(
					anchorNode?.parentElement as HTMLElement
				)
				if (anchorNode?.nextSibling) {
					if (anchorOffset === 0) {
						adjustedAnchorOffset = componentIndex
					} else {
						adjustedAnchorOffset = componentIndex + 1
					}
				} else {
					if (anchorOffset === 0) {
						adjustedAnchorOffset = componentIndex
					} else {
						adjustedAnchorOffset = componentIndex + 1
					}
				}
			}

			if (adjustedFocusOffset !== null && adjustedAnchorOffset !== null) {
				selection.setBaseAndExtent(inputNode, adjustedAnchorOffset, inputNode, adjustedFocusOffset)
			} else if (adjustedFocusOffset !== null) {
				selection.extend(inputNode, adjustedFocusOffset)
			}
		}
	}

	adjustSelectionForceOutOfComponent(selection?: Selection | null) {
		selection = selection || window.getSelection()
		if (!selection || !selection.rangeCount) return

		const { inputNode } = this
		const { focusNode, focusOffset } = selection
		const componentNode = focusNode?.parentElement as HTMLElement

		if (!componentNode || !componentNode.classList.contains('ntv__input-component')) {
			return
		}

		const range = selection.getRangeAt(0)
		const { startContainer } = range
		const nextSibling = startContainer.nextSibling

		if (selection.isCollapsed) {
			if (nextSibling) {
				if (componentNode.previousSibling instanceof Text) {
					selection.collapse(componentNode.previousSibling, componentNode.previousSibling.length)
				} else {
					const emptyTextNode = document.createTextNode('')
					componentNode.before(emptyTextNode)
					selection.collapse(emptyTextNode, 0)
				}
			} else {
				if (componentNode.nextSibling instanceof Text) {
					selection.collapse(componentNode.nextSibling, 0)
				} else {
					const emptyTextNode = new Text('')
					inputNode.appendChild(emptyTextNode)
					selection.collapse(emptyTextNode, 0)
				}
			}
		} else {
			error('Unadjusted selection focus somehow reached inside component. This should never happen.')
		}
	}

	insertText(text: string) {
		const { inputNode } = this

		if (!this.isInputEnabled) return

		const selection = window.getSelection()
		if (!selection) {
			inputNode.append(new Text(text))
			inputNode.normalize()
			this.hasUnprocessedContentChanges = true
			return
		}

		let range
		if (selection.rangeCount) {
			const { focusNode, anchorNode } = selection
			const componentNode = focusNode?.parentElement as HTMLElement

			// Adjust the selection if the focus is inside a component
			if (focusNode && componentNode && componentNode.classList.contains('ntv__input-component')) {
				const componentIndex = Array.from(inputNode.childNodes).indexOf(componentNode)
				if (focusNode.nextSibling) {
					if (selection.isCollapsed) {
						selection.setPosition(inputNode, componentIndex)
					} else {
						selection.extend(inputNode, componentIndex)
					}
				} else {
					if (selection.isCollapsed) {
						selection.setPosition(inputNode, componentIndex + 1)
					} else {
						selection.extend(inputNode, componentIndex + 1)
					}
				}
			} else if (
				(focusNode !== inputNode && focusNode?.parentElement !== inputNode) ||
				(anchorNode !== inputNode && anchorNode?.parentElement !== inputNode)
			) {
				inputNode.append(new Text(text))
				inputNode.normalize()
				this.hasUnprocessedContentChanges = true

				if (inputNode.lastChild) {
					const range = document.createRange()
					range.setStartAfter(inputNode.lastChild!)
					selection.removeAllRanges()
					selection.addRange(range)
				}
				return
			}

			range = selection.getRangeAt(0)
		} else {
			range = new Range()
			range.setStart(inputNode, inputNode.childNodes.length)
		}

		range.deleteContents()
		range.insertNode(document.createTextNode(text))
		range.collapse()
		selection.removeAllRanges()
		selection.addRange(range)
		this.normalizeComponents()
		inputNode.normalize()

		this.hasUnprocessedContentChanges = true
	}

	private insertNodes(nodes: Node[]) {
		log('Inserting nodes', nodes)

		const selection = document.getSelection()
		if (!selection) return

		if (!selection.rangeCount) {
			for (let i = 0; i < nodes.length; i++) {
				this.inputNode.appendChild(nodes[i])
			}
			Caret.collapseToEndOfNode(this.inputNode.lastChild!)
			this.hasUnprocessedContentChanges = true
			return
		}

		const { inputNode } = this
		const { focusNode, focusOffset } = selection
		const componentNode = focusNode?.parentElement as HTMLElement

		// Adjust the selection if the focus is inside a component
		if (focusNode && componentNode && componentNode.classList.contains('ntv__input-component')) {
			const componentIndex = Array.from(inputNode.childNodes).indexOf(componentNode)
			if (focusNode.nextSibling) {
				if (selection.isCollapsed) {
					selection.setPosition(inputNode, componentIndex)
				} else {
					selection.extend(inputNode, componentIndex)
				}
			} else {
				if (selection.isCollapsed) {
					selection.setPosition(inputNode, componentIndex + 1)
				} else {
					selection.extend(inputNode, componentIndex + 1)
				}
			}
		}

		let range = selection.getRangeAt(0)
		range.deleteContents()

		for (let i = nodes.length - 1; i >= 0; i--) {
			range.insertNode(nodes[i])
		}

		range.collapse()
		inputNode.normalize()

		this.hasUnprocessedContentChanges = true
	}

	private insertComponent(component: HTMLElement) {
		const { inputNode } = this

		const selection = document.getSelection()
		if (!selection) {
			inputNode.appendChild(component)
			this.hasUnprocessedContentChanges = true
			return error('Selection API is not available, please use a modern browser supports the Selection API.')
		}

		if (!selection.rangeCount) {
			const range = new Range()
			range.setStart(inputNode, inputNode.childNodes.length)
			range.insertNode(component)
			range.collapse()
			selection.addRange(range)

			this.hasUnprocessedContentChanges = true
			return
		}

		const { focusNode, focusOffset } = selection
		const componentNode = focusNode?.parentElement as HTMLElement

		// Adjust the selection if the focus is inside a component
		if (focusNode && componentNode && componentNode.classList.contains('ntv__input-component')) {
			const componentIndex = Array.from(inputNode.childNodes).indexOf(componentNode)
			if (focusNode.nextSibling) {
				if (selection.isCollapsed) {
					selection.setPosition(inputNode, componentIndex)
				} else {
					selection.extend(inputNode, componentIndex)
				}
			} else {
				if (selection.isCollapsed) {
					selection.setPosition(inputNode, componentIndex + 1)
				} else {
					selection.extend(inputNode, componentIndex + 1)
				}
			}
		}

		let range = selection.getRangeAt(0)
		let { commonAncestorContainer } = range
		if (commonAncestorContainer !== inputNode && commonAncestorContainer.parentElement !== inputNode) {
			range = new Range()
			range.setStart(inputNode, inputNode.childNodes.length)
			commonAncestorContainer = range.commonAncestorContainer
		}
		range.deleteContents()
		this.normalizeComponents()

		const { startContainer, startOffset } = range
		const isFocusInInputNode = startContainer === inputNode

		// If selection is not in inputNode, append component to end.
		if (!isFocusInInputNode && startContainer.parentElement !== inputNode) {
			inputNode.appendChild(component)
		}

		// Caret is inbetween text nodes, so we insert the component at the caret position.
		else if (isFocusInInputNode) {
			if (inputNode.childNodes[startOffset]) {
				inputNode.insertBefore(component, inputNode.childNodes[startOffset])
			} else {
				inputNode.appendChild(component)
			}
		}

		// Caret is in a text node, so we insert the component at the caret position in the text node.
		else if (startContainer instanceof Text) {
			range.insertNode(component)
		} else {
			return error('Encountered unexpected unprocessable node', component, startContainer, range)
		}

		range.setEnd(component.childNodes[2], 1)
		range.collapse()
		selection.removeAllRanges()
		selection.addRange(range)

		this.hasUnprocessedContentChanges = true

		// inputNode.normalize()
		inputNode.dispatchEvent(new Event('input'))
	}

	insertEmote(emoteHid: string) {
		assertArgDefined(emoteHid)
		const { messageHistory, eventTarget } = this
		const { emotesManager } = this.session

		if (!this.isInputEnabled) return null

		// Inserting emote means you chose the history entry, so we reset the cursor
		messageHistory.resetCursor()

		const emoteHTML = emotesManager.getRenderableEmoteByHid(emoteHid)
		if (!emoteHTML) {
			error('Invalid emote embed')
			return null
		}

		const emoteComponent = this.createEmoteComponent(emoteHid, emoteHTML)

		this.insertComponent(emoteComponent)

		const wasNotEmpty = this.inputEmpty
		if (wasNotEmpty) this.inputEmpty = false

		this.processInputContent()

		if (wasNotEmpty) {
			eventTarget.dispatchEvent(new CustomEvent('is_empty', { detail: { isEmpty: false } }))
		}

		return emoteComponent
	}

	replaceEmote(component: HTMLElement, emoteHid: string) {
		const { emotesManager } = this.session

		const emoteHTML = emotesManager.getRenderableEmoteByHid(emoteHid)
		if (!emoteHTML) {
			error('Invalid emote embed')
			return null
		}

		const emoteBox = component.querySelector('.ntv__inline-emote-box')
		if (!emoteBox) {
			error('Component does not contain emote box')
			return null
		}

		emoteBox.innerHTML = emoteHTML
		emoteBox.setAttribute('data-emote-hid', emoteHid)

		this.hasUnprocessedContentChanges = true
		this.processInputContentDebounce()

		return component
	}

	replaceEmoteWithText(component: HTMLElement, text: string) {
		const { inputNode } = this

		const textNode = document.createTextNode(text)
		component.replaceWith(textNode)

		const selection = document.getSelection()
		if (!selection) return

		const range = document.createRange()
		range.setStart(textNode, text.length)
		range.setEnd(textNode, text.length)
		selection.removeAllRanges()
		selection.addRange(range)

		inputNode.normalize()

		this.hasUnprocessedContentChanges = true
		this.processInputContentDebounce()

		return textNode
	}
}
