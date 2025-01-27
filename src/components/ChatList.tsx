import { createSignal, onMount, onCleanup, For, batch, createEffect } from 'solid-js'
import MessageComponent, { Message } from './Message'
import { createStore } from 'solid-js/store'
import ChatController from 'ChatController'
import styles from './ChatList.module.css'

const { log, error } = console

// Maximum amount of entries to keep in the chunk
const maxChunkCapacity = 1000

// Amount of extra entries to keep in the chunk before truncating
const chunkOverflowBuffer = 200

// Maximum amount of visible entries to show in the viewport
const maxViewportCapacity = 25

// Amount of entries to load after the last visible entry
const viewportOverflowBuffer = 20

// Smallest possible height of a message element
const minMessageHeight = 40

let _uid = 0
function uid() {
	return _uid++
}

interface WrappedEntry {
	cachedHeight: number
	offset: number
	message: Message
}

export default function ChatWindow(props: { chatController: ChatController }) {
	const [chunkEntries, setChunkEntries] = createStore<WrappedEntry[]>([])
	// const [getChunkHeight, setChunkHeight] = createSignal(0)
	const [getCachedChunkHeight, setCachedChunkHeight] = createSignal(0)
	const [viewportEntries, setViewportEntries] = createStore<WrappedEntry[]>([])
	const [getScrollTop, setScrollTop] = createSignal(0)
	const [getIsSticky, setIsSticky] = createSignal(true)

	const entryIndexMap = new Map<string, number>()

	let viewportRect: DOMRect
	let viewportHeight = 0
	let scrollContainerRef!: HTMLDivElement
	let entriesSinceUnsticky = 0
	let resizeObserver: ResizeObserver
	let calculatedViewportCapacity = 20

	const chatController = props.chatController
	chatController.addEventListener('message', e => addMessage(e.detail))

	onMount(() => {
		// setInterval(() => {
		// 	const span = document.querySelector('.ntv__message:nth-child(10) span:last-child') as HTMLSpanElement
		// 	if (span)
		// 		span.textContent =
		// 			'AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA '
		// 	// const div = document.querySelector('.ntv__message:nth-child(8)') as HTMLDivElement
		// 	// if (div) div.style.display = 'none'
		// }, 1000)

		// setTimeout(() => {
		// 	const span = document.querySelector('.ntv__message span:last-child') as HTMLSpanElement
		// 	if (span)
		// 		span.textContent =
		// 			'AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA '
		// }, 1000)

		// setInterval(() => {
		// 	batch(() => {
		// 		for (let i = 0; i < chunkEntries.length; i++) {
		// 			const entry = chunkEntries[i]
		// 			const offset = entry.offset + Math.random() * 20 - 10
		// 			setChunkEntries(i, 'offset', offset)
		// 		}
		// 	})
		// }, 100)

		const updateEntrySize = (resizeEntry: ResizeObserverEntry) => {
			if (resizeEntry.target == null) {
				error('No target found on resize event')
				return
			}

			const el = resizeEntry.target as HTMLDivElement
			const blockSize = resizeEntry.borderBoxSize[0]?.blockSize

			const entryUid = el.dataset.uid //? Maybe need to check class name as well for compatibility with other frameworks
			if (entryUid == null) {
				error('No data-uid attribute found on message element')
				return
			}

			//? Could maybe turn into hashmap by using elements as hashmap keys, or cache height into DOM as attribute
			const index = chunkEntries.findLastIndex(entry => entry.message.id === entryUid)
			if (index === -1) {
				error('No entry found for message element', entryUid)
				return
			}

			if (blockSize === 0) {
				const viewportIndex = viewportEntries.findLastIndex(entry => entry.message.id === entryUid)
				if (viewportIndex === -1) {
					return // Element got unloaded, don't update height and reflow
				}
			}

			const entry = chunkEntries[index]
			if (entry.cachedHeight === blockSize) {
				// log('Height is the same, no need to update', blockSize)
				return
			}

			// log('Updating height', entry.cachedHeight, blockSize)

			setChunkEntries(index, 'cachedHeight', blockSize)
			return index
		}

		resizeObserver = new ResizeObserver(resizeEntries => {
			let smallestIndex = chunkEntries.length - 1

			if (resizeEntries.length > 1) {
				batch(() => {
					for (const resizeEntry of resizeEntries) {
						const index = updateEntrySize(resizeEntry)
						if (index && index < smallestIndex) smallestIndex = index
					}
				})
			} else {
				const index = updateEntrySize(resizeEntries[0])
				if (index) smallestIndex = index
			}

			if (smallestIndex < chunkEntries.length - 1) reflowOffsets(smallestIndex + 1)
			if (getIsSticky()) scrollViewportToBottom()
		})

		viewportRect = scrollContainerRef.getBoundingClientRect()
		viewportHeight = viewportRect.height
		calculatedViewportCapacity = Math.ceil(viewportHeight / minMessageHeight)

		// window.addEventListener('wheel', e => {
		// 	if (!scrollContainerRef.contains(e.target as Node) || e.target === scrollContainerRef) return

		// 	const scrollDir = e.deltaY > 0 // true = down, false = up
		// 	log('Wheel event', scrollDir, e.deltaY)

		// 	const isSticky = getIsSticky()
		// 	if (isSticky && scrollDir) return

		// 	const scrollTop = scrollContainerRef.scrollTop + e.deltaY
		// 	setScrollTop(scrollTop)

		// 	if (isSticky && !scrollDir) {
		// 		setIsSticky(false)
		// 	} else if (!isSticky && scrollDir && scrollTop + viewportHeight >= getChunkHeight() - 50) {
		// 		setIsSticky(true)
		// 		scrollViewportToBottom()
		// 		if (entriesSinceUnsticky) entriesSinceUnsticky = 0
		// 	}

		// 	updateViewport()
		// })
	})

	onCleanup(() => {
		// TODO cleanup chatController event listeners
		resizeObserver.disconnect()
	})

	/**
	 * Add a message to the chat list
	 * @param message The message to add
	 * @param ignoreSticky Ignore sticky state when adding messages
	 * @returns The amount of messages that were added
	 */
	function addMessage(message: Message, ignoreSticky = false) {
		if (!ignoreSticky && !getIsSticky()) {
			if (entriesSinceUnsticky < maxChunkCapacity) entriesSinceUnsticky++

			if (entriesSinceUnsticky > viewportOverflowBuffer) {
				// log('More than 100 messages since unsticky, skipping', entriesSinceUnsticky)
				return 0
			}
		}

		// log('Adding message', message.content.substring(0, 6))

		if (chunkEntries.length > maxChunkCapacity + chunkOverflowBuffer) {
			const chunkSlice = chunkEntries.slice(-maxChunkCapacity + 1)

			// Shift offsets of sliced entries to 0
			const firstOffset = chunkSlice[0].offset
			batch(() => {
				setChunkEntries(chunkSlice)

				for (let i = 0; i < chunkSlice.length; i++) {
					setChunkEntries(i, 'offset', offset => offset - firstOffset)
				}

				const lastEntry = chunkSlice[chunkSlice.length - 1]
				setChunkEntries([
					...chunkSlice,
					{
						cachedHeight: 0,
						offset: lastEntry ? lastEntry.offset + lastEntry.cachedHeight : 0,
						message
					}
				])
			})
		} else {
			const lastEntry = chunkEntries[chunkEntries.length - 1]
			setChunkEntries([
				...chunkEntries,
				{
					cachedHeight: 0,
					offset: lastEntry ? lastEntry.offset + lastEntry.cachedHeight : 0,
					message
				}
			])
		}

		// Update cached height of the entire chunk
		//? getChunkHeight()
		updateViewport()

		return 1
	}

	/**
	 * Batch add messages to the chat list
	 * @param messages The messages to add
	 * @param ignoreSticky Ignore sticky state when adding messages
	 * @returns The amount of messages that were added
	 */
	function batchAddMessages(messages: Message[], ignoreSticky = false) {
		if (!messages.length) {
			log('No messages to batch add...')
			return 0
		}

		if (!ignoreSticky && !getIsSticky()) {
			if (entriesSinceUnsticky + messages.length > viewportOverflowBuffer) {
				// log('More than 100 messages since unsticky, skipping', entriesSinceUnsticky)
				const remainingCapacity = entriesSinceUnsticky - viewportOverflowBuffer
				entriesSinceUnsticky = Math.min(maxChunkCapacity, entriesSinceUnsticky + messages.length)

				if (remainingCapacity) messages = messages.slice(0, remainingCapacity)
				else return 0
			}
		}

		if (messages.length > maxChunkCapacity) {
			error('Too many messages to batch add, truncating..', messages.length)
			messages = messages.slice(-maxChunkCapacity)
		}

		// TODO confirm that chunkEntries is indeed empty when cleared before calling this function

		batch(() => {
			// Truncate chunk if it's too large before adding new messages
			if (chunkEntries.length + messages.length > maxChunkCapacity + chunkOverflowBuffer) {
				// TODO check if this is correct
				const slicedChunkEntries = chunkEntries.slice(maxChunkCapacity - messages.length)

				// Shift offsets of sliced entries to 0
				const firstOffset = slicedChunkEntries[0].offset

				setChunkEntries(slicedChunkEntries)

				for (let i = 0; i < slicedChunkEntries.length; i++) {
					setChunkEntries(i, 'offset', offset => offset - firstOffset)
				}
			}

			const lastIndex = chunkEntries.length - 1
			const lastEntry = chunkEntries[lastIndex]
			const lastOffset = lastEntry ? lastEntry.offset + lastEntry.cachedHeight : 0

			const entries = []
			for (const message of messages) {
				entries.push({
					cachedHeight: 0,
					offset: lastOffset,
					message
				})
			}

			setChunkEntries([...chunkEntries, ...entries])
		})

		// Update cached height of the entire chunk
		//? getChunkHeight()
		updateViewport()

		return messages.length
	}

	/**
	 * Called when a new message element is created in the DOM
	 * @param el The message element
	 * @param entry The entry associated with the message element
	 */
	function onElementCreated(el: HTMLDivElement, entry: WrappedEntry) {
		resizeObserver.observe(el)

		const isSticky = getIsSticky()
		if (isSticky) scrollViewportToBottom()
	}

	/**
	 * Reflow the offsets of the chunk entries starting from the given index
	 * @param index The index to start reflowing from
	 */
	function reflowOffsets(index: number) {
		if (index > chunkEntries.length - 1) return

		let runningOffset = chunkEntries[index - 1]
			? chunkEntries[index - 1].offset + chunkEntries[index - 1].cachedHeight
			: 0

		batch(() => {
			for (let i = index; i < chunkEntries.length; i++) {
				setChunkEntries(i, 'offset', runningOffset)
				runningOffset += chunkEntries[i].cachedHeight
			}
		})

		// Update cached height of the entire chunk
		getChunkHeight()

		const isSticky = getIsSticky()
		if (isSticky) scrollViewportToBottom()

		// Force update visible entries to reflect the new offsets in DOM after resizing
		//! theres no need because offset is reactive
		// setVisibleEntries([...visibleEntries])
	}

	/**
	 * Update the visible entries in the viewport
	 */
	function updateViewport() {
		const scrollTop = getScrollTop()
		const endIndex = Math.max(
			0,
			chunkEntries.findLastIndex(entry => entry.offset <= scrollTop + viewportHeight)
		)

		let startIndex = endIndex - calculatedViewportCapacity
		const maxDisplayLength = Math.max(0, endIndex - 200)
		for (let i = endIndex; i >= maxDisplayLength; i--) {
			const entry = chunkEntries[i]
			if (entry.offset + entry.cachedHeight >= scrollTop - minMessageHeight) {
				startIndex = i
			}
		}

		setViewportEntries(chunkEntries.slice(startIndex, endIndex + viewportOverflowBuffer))
	}

	/**
	 * Scroll the viewport to the bottom of the chat
	 */
	function scrollViewportToBottom() {
		const scrollTop = Math.max(0, getCachedChunkHeight() - viewportHeight + 10)
		scrollContainerRef.scrollTop = scrollTop
		setScrollTop(scrollTop)
	}

	/**
	 * Catch up on messages that were skipped while unsticky
	 * @param skipToEnd Skip to the end of the chat
	 */
	function catchUpEntries(skipToEnd = false) {
		if (!entriesSinceUnsticky) {
			log('No entries to catch up on')
			return
		}

		let entries
		if (skipToEnd) {
			log('Catching up to the end')

			const headIndex = chatController.getHeadIndex()
			entries = chatController.getChunk(headIndex - maxChunkCapacity, headIndex)
			entriesSinceUnsticky = 0
		} else {
			const lastEntryId = chunkEntries[chunkEntries.length - 1]?.message.id
			if (!lastEntryId) return

			entries = chatController.getChunkId(lastEntryId, viewportOverflowBuffer)
		}

		if (!entries) {
			error('No entries to catch up on, at least some entries were expected')
			return
		}

		batchAddMessages(entries, true)
	}

	let lastScrollTop = 0
	/**
	 * Handle scroll events on the scroll container
	 * @param scrollTop The current scroll top position
	 */
	function handleScroll(scrollTop: number) {
		if (Math.abs(getScrollTop() - scrollTop) < 2) return

		const scrollDir = lastScrollTop < scrollTop // true = down, false = up
		const isSticky = getIsSticky()

		if (isSticky && !scrollDir && scrollTop + viewportHeight <= getChunkHeight() - 2) {
			setIsSticky(false)
		} else if (!isSticky && scrollDir && scrollTop + viewportHeight >= getChunkHeight() - 50) {
			catchUpEntries()

			const lastEntryId = chunkEntries[chunkEntries.length - 1]?.message.id
			if (lastEntryId && !chatController.getAheadCountById(lastEntryId)) {
				entriesSinceUnsticky = 0
				setIsSticky(true)
				scrollViewportToBottom()
			}
		} else if (isSticky) {
			// We don't want to update viewport when sticky creates artificial scroll events
			lastScrollTop = scrollTop
			setScrollTop(scrollTop)
			return
		}

		setScrollTop(scrollTop)
		lastScrollTop = scrollTop

		updateViewport()
	}

	/**
	 * Get the height of the entire chunk.
	 * It also caches the height of the chunk.
	 * @returns The height of the entire chunk
	 */
	function getChunkHeight() {
		const lastEntry = chunkEntries[chunkEntries.length - 1]
		const height = lastEntry ? lastEntry.offset + lastEntry.cachedHeight : 0
		// const height = chunkEntries.reduce((acc, entry) => acc + entry.cachedHeight, 0)
		setCachedChunkHeight(height)
		return height
	}

	return (
		<div
			class="scrollContainer"
			ref={scrollContainerRef}
			style={{ height: '100%', 'overflow-y': 'scroll', contain: 'strict' }}
			onScroll={e => handleScroll(e.currentTarget.scrollTop)}>
			<div /* used as a spacer to mimic full height of the entire message stack */
				style={{ height: getChunkHeight() + 'px', position: 'relative' }}>
				<For each={viewportEntries}>
					{(entry, i) => (
						<MessageComponent
							offset={entry.offset}
							{...entry.message}
							ref={el => onElementCreated(el, entry)}
						/>
					)}
				</For>
			</div>
		</div>
	)
}
