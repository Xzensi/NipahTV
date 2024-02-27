import { log } from '../utils'

export class Caret {
	static collapseToEndOfNode(selection, range, node) {
		const newRange = range.cloneRange()
		newRange.setStartAfter(node)
		newRange.collapse(true)
		selection.removeAllRanges()
		selection.addRange(newRange)
		selection.collapseToEnd()
	}

	static hasNonWhitespaceCharacterBeforeCaret() {
		const selection = window.getSelection()
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
				textContent = childNode.textContent
				offset = textContent.length - 1
			} else {
				return false
			}
		}

		if (!textContent) return false
		const leadingChar = textContent[offset]
		return leadingChar && leadingChar !== ' '
	}

	static hasNonWhitespaceCharacterAfterCaret() {
		const selection = window.getSelection()
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
				textContent = childNode.textContent
				offset = textContent.length - 1
			} else {
				return false
			}
		}

		if (!textContent) return false
		const trailingChar = textContent[offset]
		return trailingChar && trailingChar !== ' '
	}

	static insertNodeAtCaret(range, node) {
		// log('Embedding node', node)

		if (!node.nodeType || (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.TEXT_NODE)) {
			return error('Invalid node type', node)
		}

		// log('Caret is in element', range.startContainer)
		// log('At position', range.startOffset)

		// Caret is inside text node, we insert at startOffset position
		if (range.startContainer.nodeType === Node.TEXT_NODE) {
			// log('Inserting in text node')
			range.insertNode(node)
		}

		// Caret is inbetween text nodes, we insert after the childNode at index startOffset
		else {
			// log('Inserting after text node')

			// When caret is at start of container, prepend node
			if (range.startOffset - 1 === -1) {
				// log('Prepending node at start of container')
				range.startContainer.prepend(node)
				return
			}

			const childNode = range.startContainer.childNodes[range.startOffset - 1]

			// Should never happen, but just in case
			// If theres no childnode, thus startOffset 0, the rule above should have caught it
			if (!childNode) {
				// log('Child node is null, appending node at end of container')
				range.startContainer.appendChild(node)
				return
			}

			childNode.after(node)
		}
	}

	// Checks if the caret is at the start of a node
	static isCaretAtStartOfNode(node) {
		const selection = window.getSelection()
		if (!selection.rangeCount) return false
		const range = selection.getRangeAt(0)

		// Find the first text node or child node
		let firstRelevantNode = null
		for (const child of node.childNodes) {
			if (child.nodeType === Node.TEXT_NODE || child.nodeType === Node.ELEMENT_NODE) {
				firstRelevantNode = child
				break
			}
		}

		if (!firstRelevantNode) return true // Node has no relevant children

		const nodeRange = document.createRange()
		if (firstRelevantNode.nodeType === Node.TEXT_NODE) {
			nodeRange.selectNodeContents(firstRelevantNode)
		} else {
			// For element nodes
			nodeRange.selectNode(firstRelevantNode)
		}
		nodeRange.collapse(true)

		return range.compareBoundaryPoints(Range.START_TO_START, nodeRange) === 0
	}

	static isCaretAtEndOfNode(node) {
		const selection = window.getSelection()
		if (!selection.rangeCount) return false
		const range = selection.getRangeAt(0)

		// Find the last text node or child node
		let lastRelevantNode = null
		for (let i = node.childNodes.length - 1; i >= 0; i--) {
			const child = node.childNodes[i]
			if (child.nodeType === Node.TEXT_NODE || child.nodeType === Node.ELEMENT_NODE) {
				lastRelevantNode = child
				break
			}
		}

		if (!lastRelevantNode) return true // Node has no relevant children

		const nodeRange = document.createRange()
		if (lastRelevantNode.nodeType === Node.TEXT_NODE) {
			nodeRange.selectNodeContents(lastRelevantNode)
		} else {
			// For element nodes
			nodeRange.selectNode(lastRelevantNode)
		}
		nodeRange.collapse(false) // Collapse to the end of the node

		return range.compareBoundaryPoints(Range.END_TO_END, nodeRange) === 0
	}

	static getWordBeforeCaret() {
		const selection = window.getSelection()
		const range = selection.getRangeAt(0)

		// return false if the caret is not in a text node
		if (range.startContainer.nodeType !== Node.TEXT_NODE) return false

		const text = range.startContainer.textContent
		const offset = range.startOffset

		// Find the start of the word
		let start = offset
		while (start > 0 && text[start - 1] !== ' ') start--

		// Find the end of the word
		let end = offset
		while (end < text.length && text[end] !== ' ') end++

		const word = text.slice(start, end)
		if (word === '') return false

		return {
			word,
			start,
			end,
			node: range.startContainer
		}
	}

	// Replace text at start to end with replacement.
	// Container is guaranteed to be a text node
	// Start and end are the indices of the text node
	// Replacement can be a string or an element node.
	static replaceTextInRange(container, start, end, replacement) {
		const text = container.textContent
		if (replacement.nodeType === Node.TEXT_NODE) {
			// Splice the text
			const newText = text.slice(0, start) + replacement.textContent + text.slice(end)
			container.textContent = newText
		} else {
			// We cannot insert an element node into a text node, so we need to split the text node
			const before = text.slice(0, start)
			const after = text.slice(end)
			container.textContent = before
			container.after(replacement)
			container.after(document.createTextNode(after))
		}
	}
}
