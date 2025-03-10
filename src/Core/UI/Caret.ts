import { Logger } from '@core/Common/Logger'

const logger = new Logger()
const { log, info, error } = logger.destruct()

export class Caret {
	static moveCaretTo(container: Node, offset: number) {
		const selection = window.getSelection()
		if (!selection || !selection.rangeCount) return

		const range = document.createRange()
		range.setStart(container, offset)
		// range.collapse(true)
		selection.removeAllRanges()
		selection.addRange(range)
	}

	static collapseToEndOfNode(node: Node) {
		const selection = window.getSelection()
		if (!selection) return error('CORE', 'UI', 'Unable to get selection, cannot collapse to end of node', node)

		const range = document.createRange()
		if (node instanceof Text) {
			const offset = node.textContent ? node.textContent.length : 0
			range.setStart(node, offset)
			// No need to set end, start is after end so end gets set to start
			// range.setEnd(node, offset)
			// Also no need to collapse, range is already collapsed
			// range.collapse()
		} else {
			range.setStartAfter(node)
			// No need to set end, start is after end so end gets set to start
			// range.setEnd(node, range.startOffset)
		}

		selection.removeAllRanges()
		selection.addRange(range)
	}

	static hasNonWhitespaceCharacterBeforeCaret() {
		const selection = window.getSelection()
		if (!selection || !selection.rangeCount) return false

		const range = selection.anchorNode ? selection.getRangeAt(0) : null
		if (!range) return false

		let textContent, offset

		const caretIsInTextNode = range.startContainer.nodeType === Node.TEXT_NODE
		if (caretIsInTextNode) {
			textContent = range.startContainer.textContent
			offset = range.startOffset - 1
		} else {
			const childNode = range.startContainer.childNodes[range.startOffset - 1]
			if (!childNode) return false

			if (childNode.nodeType === Node.TEXT_NODE) {
				textContent = childNode.textContent || ''
				offset = textContent.length - 1
			} else {
				return false
			}
		}

		if (!textContent) return false
		const leadingChar = textContent[offset]
		return leadingChar !== ' ' && leadingChar !== '\uFEFF'
	}

	static hasNonWhitespaceCharacterAfterCaret() {
		const selection = window.getSelection()
		if (!selection) return false

		const range = selection.anchorNode ? selection.getRangeAt(0) : null
		if (!range) return false

		let textContent, offset

		const caretIsInTextNode = range.startContainer.nodeType === Node.TEXT_NODE
		if (caretIsInTextNode) {
			textContent = range.startContainer.textContent
			offset = range.startOffset
		} else {
			const childNode = range.startContainer.childNodes[range.startOffset]
			if (!childNode) return false

			if (childNode.nodeType === Node.TEXT_NODE) {
				textContent = childNode.textContent || ''
				offset = textContent.length - 1
			} else {
				return false
			}
		}

		if (!textContent) return false
		const trailingChar = textContent[offset]
		return trailingChar !== ' ' && trailingChar !== '\uFEFF'
	}

	// Checks if the caret is at the start of a node
	static isCaretAtStartOfNode(node: Node) {
		const selection = window.getSelection()
		if (!selection || !selection.rangeCount || !selection.isCollapsed) return false

		if (!node.childNodes.length) return true

		const { focusNode, focusOffset } = selection
		if (focusNode === node && focusOffset === 0) return true

		if (
			focusNode?.parentElement?.classList.contains('ntv__input-component') &&
			!focusNode?.previousSibling &&
			focusOffset === 0
		) {
			return true
		} else if (focusNode instanceof Text) {
			return focusNode === node.firstChild && focusOffset === 0
		} else {
			return false
		}
	}

	static isCaretAtEndOfNode(node: Node) {
		const selection = window.getSelection()
		if (!selection || !selection.rangeCount || !selection.isCollapsed) return false

		if (!node.childNodes.length) return true

		const { focusNode, focusOffset } = selection
		if (focusNode === node && focusOffset === node.childNodes.length) return true

		if (
			focusNode?.parentElement?.classList.contains('ntv__input-component') &&
			!focusNode?.nextSibling &&
			focusOffset === 1
		) {
			return true
		} else if (focusNode instanceof Text) {
			return focusNode === node.lastChild && focusOffset === focusNode.textContent?.length
		} else {
			return false
		}
	}

	static getWordBeforeCaret() {
		const selection = window.getSelection()
		if (!selection || !selection.rangeCount) {
			return {
				word: null,
				start: 0,
				end: 0,
				startOffset: 0,
				node: null
			}
		}

		const range = selection.getRangeAt(0)

		// If not text node, see if we can get the last direct text node child and get the word from there instead
		if (range.startContainer.nodeType !== Node.TEXT_NODE) {
			const textNode = range.startContainer.childNodes[range.startOffset - 1]

			if (textNode && textNode.nodeType === Node.TEXT_NODE) {
				const text = textNode.textContent || ''
				const startOffset = text.lastIndexOf(' ') + 1
				const word = text.slice(startOffset)
				if (word) {
					return {
						word,
						start: startOffset,
						end: text.length,
						startOffset: text.length,
						node: textNode
					}
				}
			}

			return {
				word: null,
				start: 0,
				end: 0,
				startOffset: 0,
				node: textNode
			}
		}

		const text = range.startContainer.textContent || ''
		const offset = range.startOffset

		// Find the start of the word
		let start = offset
		while (start > 0 && text[start - 1] !== ' ') start--

		// Find the end of the word
		let end = offset
		while (end < text.length && text[end] !== ' ') end++

		const word = text.slice(start, end)
		if (word === '') {
			return {
				word: null,
				start: 0,
				end: 0,
				startOffset: 0,
				node: null
			}
		}

		return {
			word,
			start,
			end,
			startOffset: offset,
			node: range.startContainer
		}
	}

	static getCaretStartOffset() {
		const selection = window.getSelection()
		if (!selection || !selection.rangeCount) return 0

		const range = selection.getRangeAt(0)
		return range.startOffset
	}

	static insertNodeAtCaret(range: Range, node: Node) {
		// log('CORE', 'UI', 'Embedding node', node)

		if (!node.nodeType || (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.TEXT_NODE)) {
			return error('CORE', 'UI', 'Invalid node type', node)
		}

		// log('CORE', 'UI', 'Caret is in element', range.startContainer)
		// log('CORE', 'UI', 'At position', range.startOffset)

		// Caret is inside text node, we insert at startOffset position
		if (range.startContainer.nodeType === Node.TEXT_NODE) {
			// log('CORE', 'UI', 'Inserting in text node')
			range.insertNode(node)
			range.startContainer?.parentElement?.normalize()
		}

		// Caret is inbetween text nodes, we insert after the childNode at index startOffset
		else {
			// log('CORE', 'UI', 'Inserting after text node')

			// When caret is at start of container, prepend node
			if (range.startOffset - 1 === -1) {
				// log('CORE', 'UI', 'Prepending node at start of container')
				;(range.startContainer as Element).prepend(node)
				return
			}

			const childNode = range.startContainer.childNodes[range.startOffset - 1]

			// Should never happen, but just in case
			// If theres no childnode, thus startOffset 0, the rule above should have caught it
			if (!childNode) {
				// log('CORE', 'UI', 'Child node is null, appending node at end of container')
				range.startContainer.appendChild(node)
				return
			}

			// log('CORE', 'UI', 'Inserting after child node', childNode)

			childNode.after(node)
		}
	}

	// Replace text at start to end with replacement.
	// Start and end are the indices of the text node
	// Replacement can be a string or an element node.
	static replaceTextInRange(container: Node, start: number, end: number, replacement: string): number {
		if (container.nodeType !== Node.TEXT_NODE) {
			error('CORE', 'UI', 'Invalid container node type', container)
			return 0
		}

		const text = container.textContent || ''
		const halfText = text.slice(0, start) + replacement
		container.textContent = halfText + text.slice(end)
		return halfText.length
	}

	static replaceTextWithElementInRange(container: Node, start: number, end: number, replacement: Node) {
		const text = container.textContent || ''
		const before = text.slice(0, start)
		const after = text.slice(end)
		container.textContent = before
		;(container as Element).after(replacement, document.createTextNode(after))
	}
}
