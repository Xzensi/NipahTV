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

			default:
				const selection = document.getSelection()
				if (selection && selection.rangeCount) {
					const range = selection.getRangeAt(0)
					if (range && range.startContainer.parentElement?.classList.contains('ntv__input-component')) {
						this.adjustSelectionForceOutOfComponent(selection)
					}
				}
			// if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
			// 	this.deleteSelectionContents()
			// }
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

		const isNotEmpty = inputNode.childNodes.length && (inputNode.childNodes[0] as HTMLElement)?.tagName !== 'BR'
		if (this.isInputEmpty === !isNotEmpty) return
		this.isInputEmpty = !this.isInputEmpty
		this.eventTarget.dispatchEvent(new CustomEvent('is_empty', { detail: { isEmpty: !isNotEmpty } }))
	}

	normalize() {
		this.inputNode.normalize()
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
		// TODO quick dirty mirrored code of deleteBackwards(), there are some issues with it that require debugging.

		const { inputNode } = this

		const selection = document.getSelection()
		if (!selection || !selection.rangeCount) return error('No ranges found in selection')

		let range = selection.getRangeAt(0)

		// Selection focus is inside component
		if (range.startContainer.parentElement?.classList.contains('ntv__input-component')) {
			this.adjustSelectionForceOutOfComponent(selection)
			range = selection.getRangeAt(0)
		}

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
			if (!isFocusInComponent) return

			const componentIndex = Array.from(inputNode.childNodes).indexOf(focusNode.parentElement as any)

			if (!focusNode?.previousSibling) {
				selection.extend(inputNode, componentIndex + 1)
			} else {
				selection.extend(inputNode, componentIndex)
			}
		}

		// const test = selection.getRangeAt(0)
		// log('Caret position:', test.startOffset, test.startContainer)
	}

	adjustSelectionForceOutOfComponent(selection?: Selection | null) {
		selection = selection || window.getSelection()
		if (!selection || !selection.rangeCount) return

		const { inputNode } = this
		const range = selection.getRangeAt(0)
		const { startContainer } = range
		const nextSibling = startContainer.nextSibling

		if (selection.isCollapsed) {
			const componentIndex = Array.from(inputNode.childNodes).indexOf(startContainer.parentElement as any)

			if (!nextSibling) {
				selection.collapse(inputNode, componentIndex + 1)
			} else {
				selection.collapse(inputNode, componentIndex)
			}
		}
		// Technically this should never happen, but just in case
		else {
			error('Selection somehow reached inside component. This should never happen. Correcting it anyway.')

			const focusNode = selection.focusNode
			if (!focusNode) return

			const componentIndex = Array.from(inputNode.childNodes).indexOf(focusNode.parentElement as any)

			if (!focusNode?.previousSibling) {
				selection.extend(inputNode, componentIndex + 1)
			} else {
				selection.extend(inputNode, componentIndex)
			}
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

	deleteSelectionContents() {
		const selection = window.getSelection()
		if (!selection || !selection.rangeCount) return

		// selection.isCollapsed
		for (let i = 0; i < selection.rangeCount; i++) {
			const range = selection.getRangeAt(i)
			if (!range.collapsed) this.deleteRangeContents(range)
		}
	}

	/**
	 * Simplistic implementation that intentionally does not traverse nodes for leaf nodes.
	 * It deletes the contents of a selection range and cleans up BOM characters around emote nodes.
	 * It makes a few assumptions about the possible input nodes and their children.
	 *
	 * Assumptions:
	 * - Input node has no children other than text nodes and emote nodes.
	 * - Emote nodes have attribute contenteditable="false", so selection anchor/focus can never be inside an emote node.
	 * - Emote nodes are always followed by either a visible character or BOM character.
	 * - Emote nodes are always preceded by either a visible character or BOM character.
	 * - BOM characters are only used to separate emote nodes.
	 */
	deleteRangeContents(range: Range) {
		const { inputNode } = this

		// So we don't have to deal with adjecent (empty?) text nodes
		inputNode.normalize()

		const startContainer = range.startContainer
		const endContainer = range.endContainer
		const previousSibling = startContainer.previousSibling
		const nextSibling = startContainer.nextSibling

		log('Range', range)

		if (range.commonAncestorContainer !== inputNode && range.commonAncestorContainer.parentElement !== inputNode)
			return error('Start container is input node, this should not happen. Bailing out.')

		// Start container is a leaf node
		// if (!(startContainer instanceof Text)) {
		// 	return error('Start container is in input node but not a text node, this should not happen. Bailing out.')
		// }

		const textContent = startContainer.textContent || ''

		// TODO removing space after emote should not delete the emote before it ==========================================================
		// TODO selecting 1 emote should not delete emote before it =======================================================================

		// Check if inside text node and not at start of text node, then delete character before startOffset.
		if (range.startOffset > 0) {
			const charBeforeStart = textContent[range.startOffset - 1]

			// Bom means either start of input or emote
			if (charBeforeStart === CHAR_ZWSP) {
				// Caret is after emote with BOM
				if (previousSibling) {
					const nodeBeforeEmote = previousSibling.previousSibling
					const nodeBeforeEmoteIsText = nodeBeforeEmote instanceof Text
					const nodeBeforeEmoteIsBOM = nodeBeforeEmoteIsText && nodeBeforeEmote.textContent === CHAR_ZWSP

					if (nodeBeforeEmoteIsBOM) {
						range.setStart(nodeBeforeEmote, nodeBeforeEmote.length - 1)
					} else if (nodeBeforeEmoteIsText) {
						range.setStart(nodeBeforeEmote, nodeBeforeEmote.length)
					} else {
						error('Encountered unexpected missing node before emote node, this should never happen.')
						range.setStart(inputNode, 0)
					}
				}

				// Caret is at start of input, between a BOM and emote (unless there is a BOM inserted mid-text..)
				else {
					// Do nothing, we don't want to delete the emote BOM at start of input node
				}
			}
			// else {
			// 	range.setStart(startContainer, range.startOffset - 1)
			// }
		}

		// Start is after emote and maybe before BOM
		else if (previousSibling) {
			const nodeBeforeEmote = previousSibling.previousSibling
			const nodeBeforeEmoteIsText = nodeBeforeEmote instanceof Text
			const nodeBeforeEmoteIsBOM = nodeBeforeEmoteIsText && nodeBeforeEmote.textContent === CHAR_ZWSP

			if (nodeBeforeEmoteIsBOM) {
				range.setStart(nodeBeforeEmote, nodeBeforeEmote.length - 1)
			} else if (nodeBeforeEmoteIsText) {
				range.setStart(nodeBeforeEmote, nodeBeforeEmote.length)
			}
		} else {
			// Start is at start of input node, do nothing
		}

		if (endContainer instanceof Text) {
			const textContent = endContainer.textContent || ''

			if (range.endOffset === 0) {
				const charAfterEnd = textContent[range.endOffset]
				if (charAfterEnd === CHAR_ZWSP) {
					range.setEnd(endContainer, 1)
				} else {
					range.setEnd(endContainer, 0)
				}
			} else {
				// Do nothing, no futher BOMs to worry about
			}
		}

		// Selection ends right after emote, before any text nodes
		else {
			if (nextSibling) {
				const nodeAfterEmoteIsText = nextSibling instanceof Text
				const nodeAfterEmoteIsBOM = nodeAfterEmoteIsText && nextSibling.textContent === CHAR_ZWSP

				if (nodeAfterEmoteIsBOM) {
					range.setEnd(nextSibling, 1)
				} else if (nodeAfterEmoteIsText) {
					range.setEnd(nextSibling, 0)
				} else {
					error('Encountered unexpected node after emote node, this should never happen.')
					range.setEnd(inputNode, inputNode.childNodes.length)
				}
			} else {
				// End is at end of input node, do nothing
			}
		}

		range.deleteContents()
	}

	insertElement(element: Element) {
		const { inputNode } = this

		const selection = window.getSelection()
		if (!selection) {
			return log('Cannot get selection, appending emote nodes to end of text field')
		}

		let range
		if (selection.rangeCount && inputNode.childNodes.length) {
			log('Selection with ranges found')
			range = selection.getRangeAt(0)
			range.setEnd(range.startContainer, range.startOffset)
		}
		// We got no selection but input node has child nodes, so we set caret at end of last child node
		else if (inputNode.childNodes.length) {
			log('No selection found, setting caret at end of last child node')
			const lastChild = inputNode.childNodes[inputNode.childNodes.length - 1]
			range = document.createRange()
			range.setStart(lastChild, lastChild.childNodes.length)
		}
		// We got no selection and input node has no child nodes, so we simply append BOM, emote and space nodes
		else {
			const BOM = document.createTextNode('\uFEFF')
			const space = document.createTextNode(' ')
			inputNode.append(BOM, element, space)
			selection.removeAllRanges()
			range = document.createRange()
			range.setStart(space, 1)
			selection.addRange(range)
			return
		}

		// If start container is not a text node, we set the range to the end of the last child node
		if (!(range.startContainer instanceof Text)) {
			log('Start container is not a text node, setting caret at end of last child node')
			const lastChild = inputNode.childNodes[inputNode.childNodes.length - 1]
			range = document.createRange()
			range.setStart(lastChild, lastChild.childNodes.length)
		}

		const startContainer = range.startContainer

		let addBOMBeforeCaret = false
		let addBOMAfterCaret = false
		let addSpaceBeforeCaret = false
		let addSpaceAfterCaret = false

		const textContent = startContainer.textContent || ''
		const isStartAtStart = range.startOffset === 0 // Start and end of text node, not input node
		const isEndAtEnd = range.endOffset === textContent.length
		const isStartOfAncestor = startContainer === inputNode.firstChild
		const isEndOfAncestor = startContainer === inputNode.lastChild
		const charBeforeCaret = textContent[range.startOffset - 1]
		const charAfterCaret = textContent[range.endOffset]
		const bomBeforeCaret = charBeforeCaret === CHAR_ZWSP
		const bomAfterCaret = charAfterCaret === CHAR_ZWSP
		const spaceAfterCaret = charAfterCaret === ' '

		log('Space before caret:', charBeforeCaret === ' ')
		log('Space after caret:', charAfterCaret === ' ')

		// First check if we need to insert BOM or space character before caret, and whether to delete existing BOM
		if (isStartAtStart && isStartOfAncestor) {
			addBOMBeforeCaret = true
		} else if (bomBeforeCaret && isStartOfAncestor) {
			// Do nothing, we leave the BOM at start of input node
		} else if (bomBeforeCaret) {
			// Delete BOM before caret, which should be after an emote here
			range.setStart(startContainer, range.startOffset - 1)
			addSpaceBeforeCaret = true
		} else if (charBeforeCaret && charBeforeCaret.trim()) {
			addSpaceBeforeCaret = true
		} else if (isStartAtStart && startContainer.previousSibling instanceof Element) {
			log('Node before caret is element, adding space before caret', startContainer.previousSibling)
			addSpaceBeforeCaret = true
		}

		// Secondly check if we need to insert space character after caret
		if (isEndAtEnd && isEndOfAncestor) {
			addSpaceAfterCaret = true
		} else if (bomAfterCaret) {
			range.setEnd(startContainer, range.endOffset + 1)
			addSpaceAfterCaret = true
		} else if (!spaceAfterCaret) {
			addSpaceAfterCaret = true
		}

		log('Range', range)
		log('Add BOM before caret:', addBOMBeforeCaret)
		log('Add BOM after caret:', addBOMAfterCaret)
		log('Add space before caret:', addSpaceBeforeCaret)
		log('Add space after caret:', addSpaceAfterCaret)

		range.deleteContents() // Collapses the range

		// Range inserts nodes from start, so we insert at reverse order
		if (addBOMAfterCaret) {
			range.insertNode(document.createTextNode(CHAR_ZWSP))
		} else if (addSpaceAfterCaret) {
			range.insertNode(document.createTextNode(' '))
		}

		range.insertNode(element)

		if (addBOMBeforeCaret) {
			range.insertNode(document.createTextNode(CHAR_ZWSP))
		} else if (addSpaceBeforeCaret) {
			range.insertNode(document.createTextNode(' '))
		}

		range.collapse() // Collapse range to end of range
		selection.removeAllRanges() // Clear all other ranges
		selection.addRange(range) // Re-add range to selection to update caret position
		inputNode.normalize()
	}

	replaceSelectedTextNodes(nodes: Node[]) {
		const { inputNode } = this

		// If text field is empty, we need to add zero-width space characters to the embed nodes
		// Otherwise, the caret will be placed outside the text field
		if (!inputNode.childNodes.length) {
			log('Input node is empty, appending emote nodes to end of input node')
			nodes.unshift(document.createTextNode('\uFEFF'))
			nodes.push(document.createTextNode(' '))
			inputNode.append(...nodes)
			Caret.collapseToEndOfNode(nodes[nodes.length - 1])
		} else {
			// Try to insert emote at caret position
			const selection = window.getSelection()

			if (selection && selection.rangeCount) {
				const range = selection.getRangeAt(0)
				log('Range', range)

				const commonAncestor = range.commonAncestorContainer
				const isCommonAncestorTextField = commonAncestor === inputNode
				const isCommonAncestorTextFieldParent = commonAncestor.parentElement === inputNode
				const isCaretInTextNodeInInputNode =
					commonAncestor instanceof Text && (isCommonAncestorTextField || isCommonAncestorTextFieldParent)

				if (isCaretInTextNodeInInputNode) {
					const startContainer = range.startContainer
					if (!(startContainer instanceof Text)) {
						error(
							'Selection start container is not a text node, selection is corrupted. This means either the selection focus has escaped outside the input node, or selection focus started right before an element (between BOM?).',
							range
						)
						return
					}

					const endContainer = range.endContainer
					if (!(endContainer instanceof Text)) {
						error(
							'Selection end container is not a text node, selection is corrupted. This means either the selection focus has escaped outside the input node, or selection focus ended right after an element (between BOM?).',
							range
						)
						// TODO should delete contents and insert emote at end of input node
						return
					}

					const textContent = startContainer.textContent
					if (!textContent) return error('Text content not found for text node start container')

					// Start and end of text node, not input node
					const isStartAtStart = range.startOffset === 0
					const isEndAtEnd = range.endOffset === textContent.length

					log('Caret start is at start', isStartAtStart, 'Caret end is at end', isEndAtEnd)

					const charBeforeCaret = textContent[range.startOffset - 1],
						charAfterCaret = textContent[range.endOffset]

					// BOM chars should always be replaced with a space. It should never be possible to have
					//  the selection caret between a BOM and element node, additional logic should prevent this.
					const bomBeforeCaret = charBeforeCaret === CHAR_ZWSP,
						bomAfterCaret = charAfterCaret === CHAR_ZWSP

					log(`Char before caret: ${charBeforeCaret}`, 'Is BOM:', bomBeforeCaret)
					log(`Char after caret: ${charAfterCaret}`, 'Is BOM:', bomAfterCaret)

					const isStartOfAncestor = startContainer === inputNode.firstChild
					const isEndOfAncestor = endContainer === inputNode.lastChild

					if (isStartAtStart) {
						const nodeBeforeIsElement = startContainer.previousSibling instanceof Element
						log('Caret is at start of input node:', isStartOfAncestor)
						log('Node before caret is element:', nodeBeforeIsElement)

						if (isStartOfAncestor) {
							nodes.unshift(document.createTextNode(CHAR_ZWSP))
						} else if (nodeBeforeIsElement) {
							nodes.unshift(document.createTextNode(' '))
						} else {
							error(
								'Selection start is at start of text node, but not at start of input node and previous node is not an element either. Is previous node a text node? It should have been normalized.',
								range
							)
						}
					} else {
						if (bomBeforeCaret) {
							const isStartBeforeBom = range.startOffset === 1
							if (isStartBeforeBom && isStartOfAncestor) {
								// Do nothing, we leave the BOM at start of input node
							} else {
								range.setStart(startContainer, range.startOffset - 1)
								nodes.unshift(document.createTextNode(' '))
							}
						}

						// Add a space if there is a non-whitespace character before the caret
						else if (charBeforeCaret.trim()) {
							nodes.unshift(document.createTextNode(' '))
						}
					}

					if (isEndAtEnd) {
						const nodeAfterIsElement = endContainer.nextSibling instanceof Element
						log('Caret is at end of input node:', isEndOfAncestor)
						log('Node after caret is element:', nodeAfterIsElement)

						if (isEndOfAncestor || nodeAfterIsElement) {
							nodes.push(document.createTextNode(' '))
						} else {
							error(
								'Selection end is at end of text node, but not at end of input node and next node is not an element either. Is next node a text node? It should have been normalized.',
								range
							)
						}
					} else {
						if (bomAfterCaret) {
							range.setEnd(endContainer, range.endOffset + 1)
						}

						// Add a space if there is a non-whitespace character after the caret
						if (bomAfterCaret || charAfterCaret.trim()) {
							nodes.push(document.createTextNode(' '))
						}
					}

					// We need to shift the start offset if there is a BOM before or after the caret
					//  so we can slice it away and replace with spaces if needed.
					// let shiftedStartOffset = range.startOffset
					// if (bomBeforeCaret || bomAfterCaret) {
					// 	const start = range.startOffset - (bomBeforeCaret ? 1 : 0)
					// 	const end = range.startOffset + (bomAfterCaret ? 1 : 0)

					// 	shiftedStartOffset = start
					// 	startContainer.textContent = textContent.slice(0, start) + textContent.slice(end)
					// }

					range.deleteContents() // Collapses the range

					// if (caretIsAtStart) {
					// 	startContainer.before(...nodes)
					// 	range.setStart(nodes[0], 0)
					// 	range.setEnd(nodes[0], 0)
					// } else if (caretIsAtEnd) {
					// 	startContainer.after(...nodes)
					// 	range.setStart(nodes[nodes.length - 1], 0)
					// 	range.setEnd(nodes[nodes.length - 1], 0)
					// } else {
					// 	// Split the text node and insert the emote embed nodes
					// 	const newTextNode = startContainer.splitText(shiftedStartOffset)
					// 	startContainer.after(...nodes)
					// 	range.setStart(newTextNode, 0)
					// 	range.setEnd(newTextNode, 0)
					// }

					// Range inserts nodes at start of range, so we insert at reverse order
					for (let i = nodes.length - 1; i >= 0; i--) {
						range.insertNode(nodes[i])
					}

					range.collapse() // Collapse range to end of range
					selection.removeAllRanges() // Clear all other ranges

					// const newRange = document.createRange(range)
					selection.addRange(range) // Re-add range to selection to update caret position
					// selection.collapseToEnd()
					// selection.collapseToStart()
					// log('Range', range, range.collapsed)
				}
				// Caret is in input node but not in text node, appending emote nodes to end of input node
				else if (commonAncestor === inputNode) {
					log(
						'Caret is in input node but not in text node, appending emote nodes to end of input node',
						range
					)
					error('This should never happen, fix this')

					// Caret is completely somewhere else, appending emote nodes to end of input node
				} else {
					log('Caret is in input node not text node, appending emote nodes to end of text field', range)
					error('This should never happen, fix this')
					nodes.push(document.createTextNode(' '))
					inputNode.append(...nodes)
					Caret.collapseToEndOfNode(nodes[nodes.length - 1])
					// Caret.collapseToEndOfNode(inputNode.childNodes[inputNode.childNodes.length - 1])
				}
			} else {
				log('No range found, appending emote nodes to end of text field')
				nodes.push(document.createTextNode(' '))
				inputNode.append(...nodes)
				Caret.collapseToEndOfNode(nodes[nodes.length - 1])
				// Caret.collapseToEndOfNode(inputNode.childNodes[inputNode.childNodes.length - 1])
			}

			// const caretIsAtStart = Caret.isCaretAtStartOfNode(inputNode)
			// const caretIsAtEnd = Caret.isCaretAtEndOfNode(inputNode)
			// log(caretIsAtStart, caretIsAtEnd)
			// log(Caret.hasNonWhitespaceCharacterBeforeCaret(), Caret.hasNonWhitespaceCharacterAfterCaret())

			// if (caretIsAtStart) nodes.unshift(document.createTextNode('\uFEFF'))
			// else if (Caret.hasNonWhitespaceCharacterBeforeCaret()) {
			// 	nodes.unshift(document.createTextNode(' '))
			// }

			// if (caretIsAtEnd && caretIsAtStart) nodes.push(document.createTextNode('\uFEFF'))
			// else if (Caret.hasNonWhitespaceCharacterAfterCaret()) {
			// 	nodes.push(document.createTextNode(' '))
			// }
		}

		inputNode.normalize()
		inputNode.dispatchEvent(new Event('input'))
		inputNode.focus()
	}

	insertText(text: string) {
		const { inputNode } = this

		const selection = window.getSelection()
		if (!selection) {
			inputNode.append(document.createTextNode(text))
			return
		}

		log('INSERTING TEXT')
		let range
		if (selection.rangeCount) {
			range = selection.getRangeAt(0)
			range.deleteContents()

			if (range.startContainer.parentElement?.classList.contains('ntv__input-component')) {
				this.adjustSelectionForceOutOfComponent(selection)
				range = selection.getRangeAt(0)
			}
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

		log(startContainer.parentElement)

		if (startContainer.parentElement?.classList.contains('ntv__input-component')) {
			this.adjustSelectionForceOutOfComponent(selection)
			range = selection.getRangeAt(0)
		}

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

		// this.deleteSelectionContents()
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
