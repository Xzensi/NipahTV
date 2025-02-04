import { createSignal, onMount, onCleanup, For, batch, createEffect, untrack } from 'solid-js'
import { FeedEntry, FeedEntryProcessedData, FeedEntryKind } from '@Core/@types/feedTypes'
import FeedProcessorPipeline from '@Core/Feed/FeedProcessorPipeline'
import { FeedController } from '@Core/Feed/FeedController'
import FeedMessage from '@Core/Components/FeedMessage'
import { createStore } from 'solid-js/store'
import { LRU } from '@Core/Common/LRU'
import styles from './ChatList.module.css'

const { log, error } = console

// Maximum amount of entries to keep unloaded
const maxUnloadedEntries = 500

// Amount of extra entries to keep unloaded before truncating
const unloadOverflowBuffer = 100

// Maximum amount of visible entries to show in the viewport
// This helps incase many zero-height entries bunch up together causing a load explosion
const maxViewportCapacity = 100

// Amount of entries to load after the last visible entry
const viewportOverflowBuffer = 20

// Smallest possible height of a message element
const minMessageHeight = 40

// Scroll distance in pixels from the bottom of the chat to trigger sticky mode
const scrollStickyThreshold = 50

// Amount of entries to load per batch
const batchLoadAmount = 20

interface WrappedFeedEntry {
	cachedHeight: number
	offset: number
	data: FeedEntry
	// processedData?: FeedEntryProcessedData
}

export default function FeedView(props: {
	feedController: FeedController<FeedEntry>
	feedProcessor: FeedProcessorPipeline
}) {
	const [unloadedEntries, setUnloadedEntries] = createStore<WrappedFeedEntry[]>([])
	const [getCachedTotalHeight, setCachedTotalHeight] = createSignal(0)
	const [viewportEntries, setViewportEntries] = createStore<WrappedFeedEntry[]>([])
	const [getScrollTop, setScrollTop] = createSignal(0)
	const [getIsSticky, setIsSticky] = createSignal(true)

	const processedDataCache = new LRU<string, FeedEntryProcessedData>(50)

	// TODO implement as signal
	const throttlingEnabled = false

	let viewportRect: DOMRect
	let viewportHeight = 0
	let scrollContainerRef!: HTMLDivElement
	let entriesSinceUnsticky = 0
	let resizeObserver: ResizeObserver
	let calculatedViewportCapacity = 20
	let entryQueue: FeedEntry[] = []
	let entryTickRate = 0,
		entryTickCount = 0

	const chatController = untrack(() => props.feedController)
	chatController.addEventListener('newEntry', e => queueEntries(e.detail))

	const feedProcessor = untrack(() => props.feedProcessor)

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
		// 		for (let i = 0; i < unloadedEntries.length; i++) {
		// 			const entry = unloadedEntries[i]
		// 			const offset = entry.offset + Math.random() * 20 - 10
		// 			setUnloadedEntries(i, 'offset', offset)
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

			if (blockSize === 0) {
				const viewportIndex = viewportEntries.findLastIndex(entry => entry.data.id === entryUid)
				if (viewportIndex === -1) {
					return // Element got unloaded, don't update height and reflow
				}
			}

			//? Could maybe turn into hashmap by using elements as hashmap keys, or cache height into DOM as attribute
			const index = unloadedEntries.findLastIndex(entry => entry.data.id === entryUid)
			if (index === -1) {
				error('No entry found for entry element', entryUid)
				return
			}

			const entry = unloadedEntries[index]
			if (entry.cachedHeight === blockSize) {
				// log('Height is the same, no need to update', blockSize)
				return
			}

			// log('Updating height', entry.cachedHeight, blockSize)

			setUnloadedEntries(index, 'cachedHeight', blockSize)
			return index
		}

		resizeObserver = new ResizeObserver(resizeEntries => {
			let smallestIndex = unloadedEntries.length - 1

			if (resizeEntries.length > 1) {
				batch(() => {
					for (const resizeEntry of resizeEntries) {
						const index = updateEntrySize(resizeEntry)
						if (index && index < smallestIndex) smallestIndex = index
						// smallestIndex = 0
					}
				})
			} else {
				const index = updateEntrySize(resizeEntries[0])
				if (index) smallestIndex = index
			}

			if (smallestIndex < unloadedEntries.length - 1) reflowOffsets(smallestIndex + 1)
			if (getIsSticky()) scrollViewportToBottom()
		})

		viewportRect = scrollContainerRef.getBoundingClientRect()
		viewportHeight = viewportRect.height
		calculatedViewportCapacity = Math.min(maxViewportCapacity, Math.ceil(viewportHeight / minMessageHeight))
		processedDataCache.setMax(Math.min(maxViewportCapacity, calculatedViewportCapacity * 2))

		window.addEventListener('wheel', e => {
			if (!scrollContainerRef.contains(e.target as Node) || e.target === scrollContainerRef) return

			const scrollDir = e.deltaY > 0 // true = down, false = up
			const isSticky = getIsSticky()

			if (isSticky && !scrollDir) setIsSticky(false)
		})

		const dt = 0.1
		const tau = 0.618
		const alpha = 1 - Math.exp(-dt / tau)
		setInterval(() => {
			const instantaneousTPS = entryTickCount / dt

			entryTickRate = entryTickRate * (1 - alpha) + instantaneousTPS * alpha
			entryTickCount = 0

			// log('Tick rate ~', entryTickRate.toFixed(2), 'TPS')
		}, dt * 1000)

		const queueLoop = () => {
			processEntryQueue()

			const delay = 20 + 550 * Math.min(1, entryTickRate / 40)
			setTimeout(queueLoop, delay)
		}
		// TODO use signal for enabling/disabling throttling
		if (throttlingEnabled) queueLoop()
	})

	onCleanup(() => {
		// TODO cleanup chatController event listeners
		resizeObserver.disconnect()
	})

	/**
	 * Add an entry to the chat list
	 * @param entries The entry to add
	 * @param ignoreSticky Ignore sticky state when adding entries
	 * @returns The amount of entries that were added
	 */
	function queueEntries(entries: FeedEntry | FeedEntry[], ignoreSticky = false) {
		const isArray = Array.isArray(entries)

		if (!ignoreSticky && !getIsSticky()) {
			if (entriesSinceUnsticky < viewportOverflowBuffer)
				entriesSinceUnsticky += isArray ? entries.length : 1

			if (entriesSinceUnsticky > viewportOverflowBuffer - 1) {
				// log('More than 100 messages since unsticky, skipping', entriesSinceUnsticky)
				return 0
			}
		}

		// log('Adding message', message.content.substring(0, 6))

		entryTickCount++

		if (throttlingEnabled) {
			if (isArray) entryQueue.push(...entries)
			else entryQueue.push(entries)

			if (entryTickRate <= 5) processEntryQueue()
		} else {
			batchAddEntries((isArray && entries) || [entries])
		}
	}

	function processEntryQueue() {
		if (!entryQueue.length) return

		if (entryQueue.length > maxUnloadedEntries) {
			error('Too many entries to batch add, truncating..', entryQueue.length)
			entryQueue = entryQueue.slice(-maxUnloadedEntries)
		}

		const entries = entryQueue
		entryQueue = []

		// if (entries.length === 1)
		batchAddEntries(entries)
	}

	function addEntry(entry: FeedEntry, ignoreSticky = false) {
		if (unloadedEntries.length > maxUnloadedEntries + unloadOverflowBuffer) {
			const unloadedSlice = unloadedEntries.slice(-maxUnloadedEntries + 1)

			// Shift offsets of sliced entries to 0
			const firstOffset = unloadedSlice[0].offset
			batch(() => {
				setUnloadedEntries(unloadedSlice)

				for (let i = 0; i < unloadedSlice.length; i++) {
					setUnloadedEntries(i, 'offset', offset => offset - firstOffset)
				}

				const lastEntry = unloadedSlice[unloadedSlice.length - 1]
				setUnloadedEntries([
					...unloadedSlice,
					{
						cachedHeight: 0,
						offset: lastEntry ? lastEntry.offset + lastEntry.cachedHeight : 0,
						data: { ...entry }
					}
				])
			})
		} else {
			const lastEntry = unloadedEntries[unloadedEntries.length - 1]
			setUnloadedEntries([
				...unloadedEntries,
				{
					cachedHeight: 0,
					offset: lastEntry ? lastEntry.offset + lastEntry.cachedHeight : 0,
					data: { ...entry }
				}
			])
		}

		// Update cached height of all unloaded entries
		//? getUnloadedHeight()
		updateViewport()

		return 1
	}

	/**
	 * Batch add entries to the list
	 * @param entries The entries to add
	 * @param ignoreSticky Ignore sticky state when adding messages
	 * @returns The amount of entries that were added
	 */
	function batchAddEntries(entries: FeedEntry[], ignoreSticky = false) {
		if (!entries.length) {
			log('No messages to batch add...')
			return 0
		}

		if (!ignoreSticky && !getIsSticky()) {
			if (entriesSinceUnsticky + entries.length > viewportOverflowBuffer - 1) {
				// log('More than 100 messages since unsticky, skipping', entriesSinceUnsticky)
				const remainingCapacity = entriesSinceUnsticky - viewportOverflowBuffer
				entriesSinceUnsticky = Math.min(viewportOverflowBuffer, entriesSinceUnsticky + entries.length)

				if (remainingCapacity) entries = entries.slice(0, remainingCapacity)
				else return 0
			}
		}

		if (entries.length > maxUnloadedEntries) {
			error('Too many entries to batch add, truncating..', entries.length)
			entries = entries.slice(-maxUnloadedEntries)
		}

		// TODO confirm that unloadedEntries is indeed empty when cleared before calling this function

		// log('Batch adding messages', messages.length)

		batch(() => {
			// Truncate unloaded if it's too large before adding new messages
			if (unloadedEntries.length + entries.length > maxUnloadedEntries + unloadOverflowBuffer) {
				const slicedUnloadedEntries = unloadedEntries.slice(-(maxUnloadedEntries - entries.length))

				// Shift offsets of sliced entries to 0
				const firstOffset = slicedUnloadedEntries[0].offset

				setUnloadedEntries(slicedUnloadedEntries)

				for (let i = 0; i < slicedUnloadedEntries.length; i++) {
					setUnloadedEntries(i, 'offset', offset => offset - firstOffset)
				}
			}

			const lastIndex = unloadedEntries.length - 1
			const lastEntry = unloadedEntries[lastIndex]
			const lastOffset = lastEntry ? lastEntry.offset + lastEntry.cachedHeight : 0

			const newEntries: WrappedFeedEntry[] = []
			for (const entryData of entries) {
				newEntries.push({
					cachedHeight: 0,
					offset: lastOffset,
					data: { ...entryData }
				})
			}

			setUnloadedEntries([...unloadedEntries, ...newEntries])
		})

		// Update cached height of all unloaded entries
		//? getUnloadedHeight()
		updateViewport()

		return entries.length
	}

	/**
	 * Called when a new message element is created in the DOM
	 * @param el The message element
	 * @param entry The entry associated with the message element
	 */
	function onElementCreated(el: HTMLDivElement, entry: WrappedFeedEntry) {
		resizeObserver.observe(el)

		const isSticky = getIsSticky()
		if (isSticky) scrollViewportToBottom()
	}

	/**
	 * Reflow the offsets of the unloaded entries starting from the given index
	 * @param index The index to start reflowing from
	 */
	function reflowOffsets(index: number) {
		if (index > unloadedEntries.length - 1) return

		let runningOffset = unloadedEntries[index - 1]
			? unloadedEntries[index - 1].offset + unloadedEntries[index - 1].cachedHeight
			: 0

		batch(() => {
			for (let i = index; i < unloadedEntries.length; i++) {
				setUnloadedEntries(i, 'offset', runningOffset)
				runningOffset += unloadedEntries[i].cachedHeight
			}
		})

		// Update cached height of all unloaded entries
		getUnloadedHeight()

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
		// TODO for performance flip findLastIndex to findIndex depending on scrollTop
		const scrollTop = getScrollTop()
		const endIndex = Math.max(
			0,
			unloadedEntries.findLastIndex(entry => entry.offset <= scrollTop + viewportHeight)
		)

		let startIndex = endIndex - calculatedViewportCapacity
		const maxDisplayLength = Math.max(0, endIndex - 200)
		for (let i = endIndex; i >= maxDisplayLength; i--) {
			const entry = unloadedEntries[i]
			if (entry.offset + entry.cachedHeight >= scrollTop - minMessageHeight) {
				startIndex = i
			}
		}

		setViewportEntries(unloadedEntries.slice(startIndex, endIndex + viewportOverflowBuffer))

		// batch(() => {
		// 	setViewportEntries(unloadedEntries.slice(startIndex, endIndex + viewportOverflowBuffer))

		// 	for (let i = 0; i < viewportEntries.length; i++) {
		// 		const entry = viewportEntries[i]
		// 		if (!entry.processedData) {
		// 			const processedData = {} //unwrap(entry.data) //{ ...entry.data }
		// 			feedProcessor.process(entry.data, processedData)
		// 			setViewportEntries(i, 'processedData', processedData)
		// 		}
		// 	}
		// })
	}

	/**
	 * Scroll the viewport to the bottom of the chat
	 */
	function scrollViewportToBottom() {
		const scrollTop = Math.max(0, getCachedTotalHeight() - viewportHeight + 10)
		scrollContainerRef.scrollTop = scrollTop
		setScrollTop(scrollTop)
	}

	/**
	 * Catch up on messages that were skipped while unsticky
	 * @param skipToEnd Skip to the end of the chat
	 */
	function catchUpEntries(skipToEnd = false) {
		// Note: entriesSinceUnsticky does not mean that we have to catch up on that many entries
		if (!entriesSinceUnsticky) {
			// log('No entries to catch up on')
			return
		}

		let entries
		if (skipToEnd) {
			log('Catching up to the end')

			const headIndex = chatController.getHeadIndex()
			entries = chatController.getChunk(headIndex - maxUnloadedEntries, headIndex)
			entriesSinceUnsticky = 0
		} else {
			const lastEntryId = unloadedEntries[unloadedEntries.length - 1]?.data.id
			if (!lastEntryId) return

			// TODO consider waiting so long that chatController lost references to catch up on after waiting
			const aheadCount = chatController.getAheadCountById(lastEntryId)
			if (!aheadCount) return

			entries = chatController.getChunkId(lastEntryId, viewportOverflowBuffer)
		}

		if (!entries) {
			error('No entries to catch up on, at least some entries were expected')
			return
		}

		batchAddEntries(entries, true)
	}

	let lastScrollTop = 0
	/**
	 * Handle scroll events on the scroll container
	 * @param scrollTop The current scroll top position
	 */
	function handleScroll(scrollTop: number) {
		const scrollDir = lastScrollTop < scrollTop // true = down, false = up
		const isSticky = getIsSticky()

		// TODO what happens to lastScrollTop calculations when unloaded gets unshifted?
		lastScrollTop = scrollTop

		// Skip scroll down events when sticky
		// This filters out artificial scroll events created by sticky
		if (isSticky && scrollDir) return

		// log('Scrolling', scrollDir ? 'down' : 'up', isSticky, scrollTop + viewportHeight, getUnloadedHeight())

		const distToEnd = getUnloadedHeight() - (scrollTop + viewportHeight)
		if (distToEnd < scrollStickyThreshold) catchUpEntries()

		if (isSticky && !scrollDir && distToEnd > 2) {
			setIsSticky(false)
		} else if (!isSticky && scrollDir && distToEnd < scrollStickyThreshold) {
			const lastEntryId = unloadedEntries[unloadedEntries.length - 1]?.data.id
			// log('Ahead count', chatController.getAheadCountById(lastEntryId))
			if (lastEntryId && !chatController.getAheadCountById(lastEntryId)) {
				log('Caught up to the end, setting sticky', scrollDir)
				entriesSinceUnsticky = 0
				setIsSticky(true)
				scrollViewportToBottom()
			}
		} else if (isSticky) {
			// We don't want to update viewport when sticky creates artificial scroll events
			setScrollTop(scrollTop)
			return
		}

		setScrollTop(scrollTop)
		updateViewport()
	}

	/**
	 * Get the height of all unloaded entries combined.
	 * It also caches the height of them in a signal.
	 * @returns The height of all unloaded entries combined
	 */
	function getUnloadedHeight() {
		const lastEntry = unloadedEntries[unloadedEntries.length - 1]
		const height = lastEntry ? lastEntry.offset + lastEntry.cachedHeight : 0
		// const height = unloadedEntries.reduce((acc, entry) => acc + entry.cachedHeight, 0)
		setCachedTotalHeight(height)
		return height
	}

	return (
		<div
			class="scrollContainer"
			ref={scrollContainerRef}
			style={{ height: '100%', 'overflow-y': 'scroll', contain: 'strict' }}
			onScroll={e => handleScroll(e.currentTarget.scrollTop)}>
			<div /* used as a spacer to mimic full height of the entire message stack */
				style={{ height: getUnloadedHeight() + 'px', position: 'relative' }}>
				<For each={viewportEntries}>
					{(entry, i) => {
						// if (!entry.processedData) {
						// 	error('No processed data found for entry', entry.data.id)
						// 	return
						// }

						let processedData = processedDataCache.get(entry.data.id)
						if (!processedData) {
							processedData = {} as FeedEntryProcessedData
							feedProcessor.process(entry.data, processedData)
							processedDataCache.set(entry.data.id, processedData)
						}

						if (entry.data.kind === FeedEntryKind.Message) {
							return (
								<FeedMessage
									offset={entry.offset}
									data={entry.data}
									processedData={processedData}
									ref={el => onElementCreated(el, entry)}
								/>
							)
						}
					}}
				</For>
			</div>
		</div>
	)
}
