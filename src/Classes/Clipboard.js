import { Caret } from '../UserInterface/Caret'
import { log, error } from '../utils'

function flattenNestedElement(node) {
	var result = []

	// Recursively traverse the node and its children
	function traverse(node) {
		// Base case: if the node is a text node, push it to the result array
		if (node.nodeType === Node.TEXT_NODE) {
			result.push(node)
		} else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'IMG') {
			result.push(node)
		} else {
			// For element nodes, push the node itself to the result array
			// result.push(node)

			// Recursively traverse each child node
			for (var i = 0; i < node.childNodes.length; i++) {
				traverse(node.childNodes[i])
			}
		}
	}

	// Start the traversal from the root node
	traverse(node)

	return result
}

export class Clipboard2 {
	domParser = new DOMParser()

	paste(text) {
		const selection = window.getSelection()
		if (!selection.rangeCount) return
		selection.deleteFromDocument()
		selection.getRangeAt(0).insertNode(document.createTextNode(text))
		selection.collapseToEnd()
	}

	pasteHTML(html) {
		const nodes = Array.from(this.domParser.parseFromString(html, 'text/html').body.childNodes)

		const selection = window.getSelection()
		if (!selection.rangeCount) return
		selection.deleteFromDocument()

		const range = selection.getRangeAt(0)

		for (const node of nodes) {
			Caret.insertNodeAtCaret(range, node)
		}

		selection.collapseToEnd()
	}

	parsePastedMessage(evt) {
		const clipboardData = evt.clipboardData || window.clipboardData
		const html = clipboardData.getData('text/html')

		if (html) {
			const doc = this.domParser.parseFromString(html, 'text/html')
			const childNodes = doc.body.childNodes

			if (childNodes.length === 0) {
				return
			}

			// Find the comment nodes containing the start and end markers
			let startFragmentComment = null,
				endFragmentComment = null
			for (let i = 0; i < childNodes.length; i++) {
				const node = childNodes[i]

				if (node.nodeType === Node.COMMENT_NODE) {
					if (node.textContent === 'StartFragment') {
						startFragmentComment = i
					} else if (node.textContent === 'EndFragment') {
						endFragmentComment = i
					}

					if (startFragmentComment && endFragmentComment) {
						break
					}
				}
			}

			if (startFragmentComment === null || !endFragmentComment === null) {
				error('Failed to find fragment markers, clipboard data seems to be corrupted.')
				return
			}

			// Slice away the content between the start and end markers
			const pastedNodes = Array.from(childNodes).slice(startFragmentComment + 1, endFragmentComment)
			const flattenedNodes = pastedNodes.map(flattenNestedElement).flat()

			const parsedNodes = []
			for (const node of flattenedNodes) {
				if (node.nodeType === Node.TEXT_NODE) {
					parsedNodes.push(node.textContent)
				} else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'IMG') {
					const emoteName = node.dataset.emoteName
					if (emoteName) {
						parsedNodes.push(emoteName)
					}
				}
			}

			if (parsedNodes.length) return parsedNodes
		} else {
			const text = clipboardData.getData('text/plain')
			if (!text) return

			return [text]
		}
	}
}
