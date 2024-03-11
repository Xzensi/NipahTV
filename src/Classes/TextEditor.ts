import { Caret } from '../UserInterface/Caret'
import { log, error } from '../utils'

const CHAR_BOM = '\uFEFF'

export class TextEditor {
	inputNode: HTMLElement

	constructor(inputNode: HTMLElement) {
		this.inputNode = inputNode satisfies ElementContentEditable
	}

	handleKeydown(evt: KeyboardEvent) {
		switch (evt.key) {
			case 'Backspace':
				evt.preventDefault()
				this.extendSelection('backward')
				this.deleteSelectionContents()
				break

			case 'Delete':
				evt.preventDefault()
				this.extendSelection('forward')
				this.deleteSelectionContents()
				break

			default:
				if (evt.key.length === 1 && !evt.ctrlKey && !evt.altKey && !evt.shiftKey && !evt.metaKey) {
					this.deleteSelectionContents()
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
			if (charBeforeStart === CHAR_BOM) {
				// Caret is after emote with BOM
				if (previousSibling) {
					const nodeBeforeEmote = previousSibling.previousSibling
					const nodeBeforeEmoteIsText = nodeBeforeEmote instanceof Text
					const nodeBeforeEmoteIsBOM = nodeBeforeEmoteIsText && nodeBeforeEmote.textContent === CHAR_BOM

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
			const nodeBeforeEmoteIsBOM = nodeBeforeEmoteIsText && nodeBeforeEmote.textContent === CHAR_BOM

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
				if (charAfterEnd === CHAR_BOM) {
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
				const nodeAfterEmoteIsBOM = nodeAfterEmoteIsText && nextSibling.textContent === CHAR_BOM

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
		const bomBeforeCaret = charBeforeCaret === CHAR_BOM
		const bomAfterCaret = charAfterCaret === CHAR_BOM
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
			range.insertNode(document.createTextNode(CHAR_BOM))
		} else if (addSpaceAfterCaret) {
			range.insertNode(document.createTextNode(' '))
		}

		range.insertNode(element)

		if (addBOMBeforeCaret) {
			range.insertNode(document.createTextNode(CHAR_BOM))
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
					const bomBeforeCaret = charBeforeCaret === CHAR_BOM,
						bomAfterCaret = charAfterCaret === CHAR_BOM

					log(`Char before caret: ${charBeforeCaret}`, 'Is BOM:', bomBeforeCaret)
					log(`Char after caret: ${charAfterCaret}`, 'Is BOM:', bomAfterCaret)

					const isStartOfAncestor = startContainer === inputNode.firstChild
					const isEndOfAncestor = endContainer === inputNode.lastChild

					if (isStartAtStart) {
						const nodeBeforeIsElement = startContainer.previousSibling instanceof Element
						log('Caret is at start of input node:', isStartOfAncestor)
						log('Node before caret is element:', nodeBeforeIsElement)

						if (isStartOfAncestor) {
							nodes.unshift(document.createTextNode(CHAR_BOM))
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
}
