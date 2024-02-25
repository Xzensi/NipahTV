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

		if (!firstRelevantNode) return false // Node has no relevant children

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
}
