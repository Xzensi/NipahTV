import { Caret } from '../UserInterface/Caret'
import { log, error, CHAR_ZWSP } from '../utils'

function flattenNestedElement(node: Node) {
	const result: Node[] = []

	// Recursively traverse the node and its children
	function traverse(node: Node) {
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

	handleCopyEvent(event: ClipboardEvent) {
		const selection = document.getSelection()
		if (!selection || !selection.rangeCount) return error('Selection is null')

		event.preventDefault()

		const range = selection.getRangeAt(0)
		if (!range) return

		// Loop over range content elements. Add text nodes to buffer and make sure top most elements are padded with space characters.
		let buffer = ''
		let prevNodeWasEmote = false
		const nodes = range.cloneContents().childNodes
		log(nodes)
		for (const node of nodes) {
			if (node instanceof Text) {
				if (prevNodeWasEmote) buffer += ' '
				prevNodeWasEmote = false
				buffer += node.textContent
			} else if (node instanceof HTMLElement) {
				const emoteImg = node.querySelector('img')

				if (emoteImg) {
					// buffer += ' '
					if (prevNodeWasEmote) buffer += ' '
					else if (buffer && buffer[buffer.length - 1] !== ' ') buffer += ' '
					prevNodeWasEmote = true
					buffer += emoteImg.dataset.emoteName || 'UNSET_EMOTE'
				}
			}
		}

		// const copyString = selection.toString().replaceAll(CHAR_ZWSP, '')
		const copyString = buffer.replaceAll(CHAR_ZWSP, '')
		event.clipboardData?.setData('text/plain', copyString)
		log(copyString)
	}

	handleCutEvent(event: ClipboardEvent) {
		const selection = document.getSelection()
		if (!selection || !selection.rangeCount) return

		// Check that the selection start and end is within a contenteditable element
		const range = selection.getRangeAt(0)
		if (!range) return

		const commonAncestorContainer = range.commonAncestorContainer as any
		if (
			!(commonAncestorContainer instanceof HTMLElement) &&
			!commonAncestorContainer.isContentEditable &&
			!commonAncestorContainer.parentElement.isContentEditable
		) {
			return
		}

		event.preventDefault()
		this.handleCopyEvent(event)
		selection.deleteFromDocument()
	}

	paste(text: string) {
		const selection = window.getSelection()
		if (!selection || !selection.rangeCount) return
		selection.deleteFromDocument()
		selection.getRangeAt(0).insertNode(document.createTextNode(text))
		selection.collapseToEnd()
	}

	pasteHTML(html: string) {
		const nodes = Array.from(this.domParser.parseFromString(html, 'text/html').body.childNodes)

		const selection = window.getSelection()
		if (!selection || !selection.rangeCount) return
		selection.deleteFromDocument()

		const range = selection.getRangeAt(0)

		for (const node of nodes) {
			Caret.insertNodeAtCaret(range, node)
		}

		// Collapse selection to the end of inserted node.
		const lastNode = nodes[nodes.length - 1]
		if (lastNode) {
			if (lastNode.nodeType === Node.TEXT_NODE) {
				selection.collapse(lastNode, (lastNode as Text).length)
				selection.collapseToEnd() //? Not sure why it needs to collapse twice
			} else if (lastNode.nodeType === Node.ELEMENT_NODE) {
				selection.collapse(lastNode, lastNode.childNodes.length)
			}
		}

		// Doesn't work correctly
		// if (lastNode) {
		// 	const range = document.createRange()
		// 	if (lastNode.nodeType === Node.TEXT_NODE) {
		// 		range.setStart(lastNode, (lastNode as Text).length)
		// 		range.setEnd(lastNode, (lastNode as Text).length)
		// 	} else if (lastNode.nodeType === Node.ELEMENT_NODE) {
		// 		range.setStart(lastNode, lastNode.childNodes.length)
		// 		range.setEnd(lastNode, lastNode.childNodes.length)
		// 	}
		// 	selection.removeAllRanges()
		// 	selection.addRange(range)
		// }
	}

	parsePastedMessage(evt: ClipboardEvent) {
		const clipboardData = evt.clipboardData || window.clipboardData
		if (!clipboardData) return

		const html = clipboardData.getData('text/html')
		if (html) {
			const doc = this.domParser.parseFromString(html.replaceAll(CHAR_ZWSP, ''), 'text/html')
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

			if (startFragmentComment === null || endFragmentComment === null) {
				error('Failed to find fragment markers, clipboard data seems to be corrupted.')
				return
			}

			// Slice away the content between the start and end markers
			const pastedNodes = Array.from(childNodes).slice(startFragmentComment + 1, endFragmentComment)
			const flattenedNodes = pastedNodes.map(flattenNestedElement).flat()

			const parsedNodes = []
			for (const node of flattenedNodes) {
				if (node.nodeType === Node.TEXT_NODE && node.textContent) {
					parsedNodes.push(node.textContent)
				} else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'IMG') {
					const emoteName = (node as HTMLElement).dataset.emoteName
					if (emoteName) {
						parsedNodes.push(emoteName)
					}
				}
			}

			if (parsedNodes.length) return parsedNodes
		} else {
			const text = clipboardData.getData('text/plain')
			if (!text) return

			return [text.replaceAll(CHAR_ZWSP, '')]
		}
	}
}
