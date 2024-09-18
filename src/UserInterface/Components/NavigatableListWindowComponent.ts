import { log, parseHTML } from '../../utils'
import { AbstractComponent } from './AbstractComponent'

/**
 * The purpose of this class is to provide a window component that
 *   can contain list entries like emotes or usernames for mentiones
 *   in chat. This component is navigatable with the arrow keys.
 */
export default class NavigatableListWindowComponent extends AbstractComponent {
	private entries: { [key: string]: unknown }[] = []
	private entriesMap: Map<HTMLElement, { [key: string]: unknown }> = new Map()
	private selectedIndex = 0
	private container: HTMLElement
	private element!: HTMLElement
	private listEl!: HTMLElement
	private classes: string
	private clickCallback: (e: MouseEvent) => void
	private eventTarget = new EventTarget()

	constructor(container: HTMLElement, classes = '') {
		super()

		this.container = container
		this.classes = classes

		this.clickCallback = this.clickHandler.bind(this)

		this.element = parseHTML(
			`<div class="ntv__nav-window ${this.classes}"><ul class="ntv__nav-window__list"></ul></div>`,
			true
		) as HTMLElement

		this.listEl = this.element.querySelector('ul') as HTMLElement
	}

	render() {
		this.container.appendChild(this.element)
	}

	attachEventHandlers() {
		this.element.addEventListener('click', this.clickCallback)
	}

	addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
		this.eventTarget.addEventListener(type, listener)
	}

	clickHandler(e: MouseEvent) {
		let targetEntry = e.target as HTMLElement
		while (targetEntry.parentElement !== this.listEl && targetEntry.parentElement !== null) {
			targetEntry = targetEntry.parentElement
		}

		const entry = this.entriesMap.get(targetEntry)
		if (entry) {
			this.setSelectedIndex(this.entries.indexOf(entry))
			this.eventTarget.dispatchEvent(new CustomEvent('entry-click', { detail: entry }))
		}
	}

	containsNode(node: Node) {
		return this.element.contains(node)
	}

	getEntriesCount() {
		return this.entries.filter(entry => entry['type'] !== 'info').length
	}

	addEntry(data: {}, element: HTMLElement) {
		this.entries.push(data)
		this.entriesMap.set(element, data)
		this.listEl.appendChild(element)
	}

	addEntries(entries: { [key: string]: unknown }[]) {
		entries.forEach(entry => {
			const element = entry.element as HTMLElement
			this.addEntry(entry, element)
		})
	}

	setEntries(entries: HTMLElement[]) {
		this.entries = []
		this.entriesMap.clear()
		while (this.listEl.firstChild) this.listEl.firstChild.remove()
		entries.forEach(el => {
			this.addEntry({}, el)
		})
	}

	clearEntries() {
		this.selectedIndex = 0
		this.entries = []
		this.entriesMap.clear()
		while (this.listEl.firstChild) this.listEl.firstChild.remove()
	}

	getSelectedEntry() {
		const entry = this.entries[this.selectedIndex]
		if (entry['type'] === 'info') return null
		return entry
	}

	setSelectedIndex(index: number) {
		this.selectedIndex = index

		this.listEl.querySelectorAll('li.selected').forEach(el => el.classList.remove('selected'))

		const selectedEl = this.listEl.children[this.selectedIndex] as HTMLElement
		selectedEl.classList.add('selected')

		this.scrollToSelected()
	}

	show() {
		this.element.style.display = 'block'
	}

	hide() {
		this.element.style.display = 'none'
	}

	// Scroll selected element into middle of the list which has max height set and is scrollable
	scrollToSelected() {
		const selectedEl = this.listEl.children[this.selectedIndex] as HTMLElement
		const listHeight = this.listEl.clientHeight
		const selectedHeight = selectedEl.clientHeight

		const win = selectedEl.ownerDocument.defaultView as Window
		const offsetTop = selectedEl.getBoundingClientRect().top + win.scrollY

		const offsetParent = selectedEl.offsetParent
		const offsetParentTop = offsetParent ? offsetParent.getBoundingClientRect().top : 0

		const relativeTop = offsetTop - offsetParentTop
		const selectedCenter = relativeTop + selectedHeight / 2
		const middleOfList = listHeight / 2
		const scroll = selectedCenter - middleOfList + this.listEl.scrollTop

		this.listEl.scrollTop = scroll
	}

	moveSelectorUp() {
		this.listEl.children[this.selectedIndex].classList.remove('selected')

		if (this.selectedIndex < this.entries.length - 1) {
			this.selectedIndex++
		} else {
			this.selectedIndex = 0
		}

		this.listEl.children[this.selectedIndex].classList.add('selected')

		this.scrollToSelected()
	}

	moveSelectorDown() {
		this.listEl.children[this.selectedIndex].classList.remove('selected')

		if (this.selectedIndex > 0) {
			this.selectedIndex--
		} else {
			this.selectedIndex = this.entries.length - 1
		}

		this.listEl.children[this.selectedIndex].classList.add('selected')

		this.scrollToSelected()
	}

	destroy() {
		this.element.removeEventListener('click', this.clickCallback)
		this.element.remove()
		// @ts-ignore
		delete this.element
		// @ts-ignore
		delete this.listEl
	}
}
