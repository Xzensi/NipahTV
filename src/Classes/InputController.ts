import { EmotesManager } from '../Managers/EmotesManager'
import { log, error, assertArgDefined, CHAR_ZWSP } from '../utils'
import { MessagesHistory } from './MessagesHistory'
import { Caret } from '../UserInterface/Caret'
import { PriorityEventTarget } from './PriorityEventTarget'
import { Clipboard2 } from './Clipboard'

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

function eventKeyIsVisibleCharacter(event: KeyboardEvent) {
	if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) return true
	return false
}

export class InputController {
	private emotesManager: EmotesManager
	private messageHistory: MessagesHistory
	private clipboard: Clipboard2
	private inputNode: HTMLElement
	private eventTarget = new PriorityEventTarget()
	isInputEmpty = true

	constructor(
		{
			emotesManager,
			messageHistory,
			clipboard
		}: { emotesManager: EmotesManager; messageHistory: MessagesHistory; clipboard: Clipboard2 },
		contentEditableEl: HTMLElement
	) {
		this.emotesManager = emotesManager
		this.messageHistory = messageHistory
		this.clipboard = clipboard
		this.inputNode = contentEditableEl satisfies ElementContentEditable
	}

	addEventListener(
		type: string,
		priority: number,
		listener: (event: any) => void,
		options?: AddEventListenerOptions
	) {
		this.eventTarget.addEventListener(type, priority, listener, options)
	}

	attachEventListeners() {
		const { inputNode, emotesManager, clipboard } = this

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
			if (!messageParts || !messageParts.length) return

			const newNodes = []
			for (let i = 0; i < messageParts.length; i++) {
				const tokens = messageParts[i].split(' ')

				for (let j = 0; j < tokens.length; j++) {
					const token = tokens[j]
					const emoteHid = emotesManager.getEmoteHidByName(token)
					if (emoteHid) {
						if (i > 0 && j > 0) {
							newNodes.push(document.createTextNode(' '))
						}
						newNodes.push(
							this.createEmoteComponent(emoteHid, emotesManager.getRenderableEmoteByHid(emoteHid))
						)
					} else if (i === 0 && j === 0) {
						newNodes.push(document.createTextNode(token))
					} else {
						newNodes.push(document.createTextNode(' ' + token))
					}
				}
			}

			this.insertNodes(newNodes)

			const isNotEmpty = inputNode.childNodes.length && (inputNode.childNodes[0] as HTMLElement)?.tagName !== 'BR'
			if (this.isInputEmpty && isNotEmpty) {
				this.isInputEmpty = isNotEmpty
				this.eventTarget.dispatchEvent(new CustomEvent('is_empty', { detail: { isEmpty: !isNotEmpty } }))
			}
		})

		// Hook the event into a PriorityTargetEvent so that it can handle stopPropagation calls
		//  for callbacks that want to intercept and cancel the event.
		this.eventTarget.addEventListener('keydown', 10, this.handleKeydown.bind(this))
		inputNode.addEventListener('keydown', this.eventTarget.dispatchEvent.bind(this.eventTarget))
		this.eventTarget.addEventListener('keyup', 10, this.handleKeyUp.bind(this))
		inputNode.addEventListener('keyup', this.eventTarget.dispatchEvent.bind(this.eventTarget))
	}

	handleKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'Backspace':
				this.deleteBackwards(event)
				break

			case 'Delete':
				this.deleteForwards(event)
				break

			case 'Enter':
				event.preventDefault()
				error('Enter key events should not be handled by the input controller.')
				break

			case ' ': // Space character key
				this.handleSpaceKey(event)
				break

			default:
				if (eventKeyIsVisibleCharacter(event)) {
					const selection = document.getSelection()
					if (selection && selection.rangeCount) {
						const range = selection.getRangeAt(0)
						if (range && range.startContainer.parentElement?.classList.contains('ntv__input-component')) {
							event.preventDefault()
							// this.adjustSelectionForceOutOfComponent(selection) // Already called in insertText()

							// This is necessary because a bug in browers seem to cause issues
							//  where appending text node to DOM during lifetime of this event
							//  causes the event's lifetime to expire and thus insert the
							//  keyDown event key before the text node was appended to the DOM.
							//  As solution we just insert the text ourselves instead.
							this.insertText(event.key)
						}
					}
				}
		}
	}

	handleKeyUp(event: KeyboardEvent) {
		const { inputNode } = this

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
		if (this.isInputEmpty === !isNotEmpty) return
		this.isInputEmpty = !this.isInputEmpty
		this.eventTarget.dispatchEvent(new CustomEvent('is_empty', { detail: { isEmpty: !isNotEmpty } }))
	}

	handleSpaceKey(event: KeyboardEvent) {
		const { inputNode } = this

		const { word, start, end, node } = Caret.getWordBeforeCaret()
		if (!word) return

		const emoteHid = this.emotesManager.getEmoteHidByName(word)
		if (!emoteHid) return

		const textContent = node.textContent
		if (!textContent) return

		node.textContent = textContent.slice(0, start) + textContent.slice(end)
		inputNode.normalize()
		// Caret.replaceTextInRange(node, start, start, '')
		Caret.moveCaretTo(node, start)
		this.insertEmote(emoteHid)

		event.preventDefault()
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
				log('Cleaning up empty component', component)
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
		componentBody.appendChild(
			(
				jQuery.parseHTML(
					`<span class="ntv__inline-emote-box" data-emote-hid="${emoteHID}" contenteditable="false">` +
						emoteHTML +
						'</span>'
				) as Element[]
			)[0]
		)
		component.appendChild(componentBody)
		component.appendChild(document.createTextNode(CHAR_ZWSP))
		return component
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

		// evt.preventDefault()
		// // range.deleteContents()
		// selection.deleteFromDocument()
		// // selection.removeAllRanges()
		// // selection.addRange(range)
		// inputNode.normalize()

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
			range.setStartBefore(inputNode.childNodes[startOffset - 1])
			rangeIncludesComponent = true
		}

		if (rangeIncludesComponent) {
			evt.preventDefault()
			range.deleteContents()
			selection.removeAllRanges()
			selection.addRange(range)
			inputNode.normalize()
		}
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

		let rangeIncludesComponent = false
		if (endContainer instanceof Text && endOffset === endContainer.textContent?.length) {
			range.setEndAfter(endContainer)
			rangeIncludesComponent = true
		} else if (isEndContainerTheInputNode && inputNode.childNodes[endOffset] instanceof Element) {
			range.setEndAfter(inputNode.childNodes[endOffset])
			rangeIncludesComponent = true
		}

		if (rangeIncludesComponent) {
			evt.preventDefault()
			range.deleteContents()
			selection.removeAllRanges()
			selection.addRange(range)
			inputNode.normalize()
		}
	}

	/**
	 * Adjusts the selection to ensure that the selection focus and anchor are never
	 *  inbetween a component's body and it's adjecent zero-width space text nodes.
	 */
	adjustSelection() {
		const selection = document.getSelection()
		if (!selection || !selection.rangeCount) return

		const { inputNode } = this
		const range = selection.getRangeAt(0)
		const { startContainer, startOffset } = range

		// If selection focus and anchor are collapsed and caret is between component body
		//  and zero-width space, push the caret out of the component on other side.
		if (selection.isCollapsed) {
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
		//  so we check if the focus is inside a component and force extend the focus past the component.
		else {
			const focusNode = selection.focusNode
			if (!focusNode) return

			const isFocusInComponent = focusNode.parentElement?.classList.contains('ntv__input-component')
			if (isFocusInComponent) {
				const componentIndex = Array.from(inputNode.childNodes).indexOf(focusNode.parentElement as any)

				if (selection.focusOffset === 0) {
					selection.extend(inputNode, componentIndex)
				} else {
					selection.extend(inputNode, componentIndex + 1)
				}
			}
		}

		// const test = selection.getRangeAt(0)
		// log('Caret position:', test.startOffset, test.startContainer)
	}

	adjustSelectionForceOutOfComponent(selection?: Selection | null) {
		selection = selection || window.getSelection()
		if (!selection || !selection.rangeCount) return

		const { inputNode } = this
		const { focusNode, focusOffset } = selection
		if (!focusNode || !focusNode.parentElement?.classList.contains('ntv__input-component')) {
			return
		}

		const range = selection.getRangeAt(0)
		const { startContainer } = range
		const nextSibling = startContainer.nextSibling

		if (selection.isCollapsed) {
			const componentNode = focusNode.parentElement as HTMLElement

			log('Is collaped, adjusting a', nextSibling, focusNode)

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

	extendSelection(direction: 'forward' | 'backward') {
		log('Text editor: Backspace key pressed')

		const { inputNode } = this

		if (!inputNode.childNodes.length) return

		const selection = window.getSelection()
		if (!selection || !selection.rangeCount) return

		// for (let i = 0; i < selection.rangeCount; i++) {
		// 	const range = selection.getRangeAt(i)
		// 	if (range.collapsed) {
		// 		selection.modify('extend', direction, 'character')
		// 		// range = selection.getRangeAt(0)
		// 	}
		// }

		selection.modify('extend', direction, 'character')
		// let range = selection.getRangeAt(0)
		// selection.removeRange(range)
		// if (range.collapsed) {
		// 	range = selection.getRangeAt(0)
		// }

		// log('Range', range)
		// selection.addRange(range)
	}

	insertText(text: string) {
		const { inputNode } = this

		const selection = window.getSelection()
		if (!selection) {
			inputNode.append(document.createTextNode(text))
			return
		}

		let range
		if (selection.rangeCount) {
			range = selection.getRangeAt(0)
			range.deleteContents()

			this.adjustSelectionForceOutOfComponent(selection)
			range = selection.getRangeAt(0)
		} else {
			range = document.createRange()
			range.setStart(inputNode, inputNode.childNodes.length)
		}

		range.insertNode(document.createTextNode(text))
		range.collapse()
		selection.removeAllRanges()
		selection.addRange(range)
		inputNode.normalize()
	}

	insertNodes(nodes: Node[]) {
		const selection = document.getSelection()
		if (!selection) return

		if (!selection.rangeCount) {
			for (let i = 0; i < nodes.length; i++) {
				this.inputNode.appendChild(nodes[i])
			}
			Caret.collapseToEndOfNode(this.inputNode.lastChild!)
			return
		}

		let range = selection.getRangeAt(0)
		const { startContainer } = range
		range.deleteContents()

		this.adjustSelectionForceOutOfComponent(selection)
		range = selection.getRangeAt(0)

		for (let i = nodes.length - 1; i >= 0; i--) {
			range.insertNode(nodes[i])
		}

		selection.collapseToEnd()
		this.inputNode.normalize
	}

	insertComponent(component: HTMLElement) {
		const { inputNode } = this

		const selection = document.getSelection()
		if (!selection) {
			inputNode.append(document.createTextNode(' '), component, document.createTextNode(' '))
			return error('Selection API is not available, please use a modern browser supports the Selection API.')
		}

		if (!selection.rangeCount) {
			inputNode.appendChild(component)
			const spacer = document.createTextNode(' ')
			inputNode.appendChild(spacer)
			const range = document.createRange()
			range.setStart(spacer, 1)
			selection.addRange(range)
			return
		}

		// If selection is inside a component make sure to push it out first
		let range = selection.getRangeAt(0)
		if (range.startContainer.parentElement?.classList.contains('ntv__input-component')) {
			this.adjustSelectionForceOutOfComponent(selection)
			range = selection.getRangeAt(0)
		}

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

		maybeInsertSpaceCharacterBeforeComponent(component)
		maybeInsertSpaceCharacterAfterComponent(component)

		// It's always guaranteed that there is a space character after a new component insertion.
		range.setEnd(component.nextSibling as Node, 1)
		range.collapse()
		selection.removeAllRanges()
		selection.addRange(range)

		// inputNode.normalize()
		inputNode.dispatchEvent(new Event('input'))
	}

	insertEmote(emoteHid: string) {
		assertArgDefined(emoteHid)
		const { emotesManager, messageHistory, eventTarget } = this

		// Inserting emote means you chose the history entry, so we reset the cursor
		messageHistory.resetCursor()

		const emoteHTML = emotesManager.getRenderableEmoteByHid(emoteHid)
		if (!emoteHTML) {
			error('Invalid emote embed')
			return null
		}

		const emoteComponent = this.createEmoteComponent(emoteHid, emoteHTML)

		this.insertComponent(emoteComponent)

		if (this.isInputEmpty) {
			this.isInputEmpty = false
			eventTarget.dispatchEvent(new CustomEvent('is_empty', { detail: { isEmpty: false } }))
		}

		return emoteComponent
	}

	replaceEmote(component: HTMLElement, emoteHid: string) {
		const { emotesManager } = this

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

		return textNode
	}
}
