const CHAR_ZERO_WIDTH = '\u200B'

function ensureLeadingCharacter(element: HTMLElement): void {
	// Get the first child of the element
	const firstChild = element.firstChild

	// If the first child is a component, prepend a zero-width space
	if (
		firstChild &&
		firstChild.nodeType === Node.ELEMENT_NODE &&
		(firstChild as HTMLElement).getAttribute('contenteditable') === 'false'
	) {
		element.insertBefore(document.createTextNode('\u200B'), firstChild)
	}
}

function normalizeComponentSpacing(container: HTMLElement): void {
	const children = Array.from(container.childNodes)
	children.forEach((child, index) => {
		if (child.nodeType === Node.ELEMENT_NODE) {
			// Ensure there's a leading character (zero-width or space) for the component
			ensureLeadingCharacter(container)

			// Adjust spacing between adjacent components
			const nextSibling = children[index + 1]
			if (nextSibling && nextSibling.nodeType === Node.ELEMENT_NODE) {
				container.insertBefore(document.createTextNode(' '), child.nextSibling)
			}
		}
	})
}

function replaceZeroWidthWithSpace(container: HTMLElement): void {
	const children = Array.from(container.childNodes)
	children.forEach((node, index) => {
		if (node.nodeType === Node.TEXT_NODE && node.textContent === '\u200B') {
			const prev = children[index - 1]
			const next = children[index + 1]
			if (prev && next && prev.nodeType === Node.ELEMENT_NODE && next.nodeType === Node.ELEMENT_NODE) {
				node.textContent = ' '
			}
		}
	})
}

function moveCaretOverComponent(direction: 'left' | 'right') {
	const selection = window.getSelection()
	if (!selection || !selection.rangeCount) return

	const range = selection.getRangeAt(0)
	let currentContainer = range.startContainer

	// Function to check if a node is a zero-width space text node
	const isZeroWidthTextNode = (node: Node) => node.nodeType === Node.TEXT_NODE && node.textContent === CHAR_ZERO_WIDTH

	if (direction === 'right') {
		let nextNode = currentContainer.nodeType === Node.TEXT_NODE ? currentContainer.nextSibling : currentContainer
		while (nextNode && nextNode.nodeType !== Node.TEXT_NODE) {
			nextNode = nextNode.nextSibling
		}
		if (nextNode && isZeroWidthTextNode(nextNode)) {
			selection.collapse(nextNode, 1) // Move the caret after the zero-width character
		} else if (nextNode) {
			selection.collapse(nextNode, 0) // Normal text node, place the caret at the start
		}
	} else if (direction === 'left') {
		let prevNode =
			currentContainer.nodeType === Node.TEXT_NODE ? currentContainer.previousSibling : currentContainer
		while (prevNode && prevNode.nodeType !== Node.TEXT_NODE) {
			prevNode = prevNode.previousSibling
		}
		if (prevNode && isZeroWidthTextNode(prevNode)) {
			selection.collapse(prevNode, 0) // Zero-width, place the caret before it (effectively skipping over it)
		} else if (prevNode) {
			selection.collapse(prevNode, prevNode.textContent?.length || 0) // Normal text node, place the caret at the end
		}
	}
}

function insertComponentAtCaret(component: HTMLElement) {
	const selection = window.getSelection()
	if (!selection || selection.rangeCount === 0) return

	const range = selection.getRangeAt(0)
	range.deleteContents() // Remove selected contents if any

	// Insert zero-width space if the component is being inserted at the start of the contenteditable
	if (
		range.startOffset === 0 &&
		(range.startContainer as HTMLElement).nodeName === '#text' &&
		range.startContainer.previousSibling === null
	) {
		const zeroWidthSpace = document.createTextNode('\u200B')
		range.insertNode(zeroWidthSpace)
		range.setStartAfter(zeroWidthSpace)
	}

	// Insert the component
	range.insertNode(component)

	// Handle spacing after the component insertion
	const nextNode = component.nextSibling
	if (nextNode && nextNode.nodeType === Node.TEXT_NODE && nextNode.textContent === '\u200B') {
		// Replace adjacent zero-width character with a space if the next node is also a component
		if (nextNode.nextSibling && nextNode.nextSibling.nodeType !== Node.TEXT_NODE) {
			nextNode.textContent = ' '
		}
	} else if (!nextNode || nextNode.nodeType !== Node.TEXT_NODE) {
		// Ensure there's a zero-width space or a space after the component if it's followed by another component or nothing
		const zeroWidthSpace = document.createTextNode('\u200B')
		if (component.parentNode) {
			component.parentNode.insertBefore(zeroWidthSpace, component.nextSibling)
		}
	}

	// Update caret position to be after the inserted component
	const newRange = document.createRange()
	newRange.setStartAfter(component)
	selection.removeAllRanges()
	selection.addRange(newRange)
}

export class TextEditor {
	constructor() {
		document.addEventListener('keydown', event => {
			if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
				event.preventDefault() // Prevent default arrow key behavior

				const direction = event.key === 'ArrowRight' ? 'right' : 'left'
				moveCaretOverComponent(direction)
			}
		})
	}
}
