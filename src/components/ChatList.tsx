import { createEffect, createRenderEffect, createSignal, For } from 'solid-js'
import MessageComponent, { Message } from '@Components/Message'
import { createStore } from 'solid-js/store'
import ChatController from 'ChatController'

const { log, error } = console

const messageMinHeight = 40
const maxMessagesInChunk = 1000
const maxMessagesInView = 12

export default function ChatListComponent(props: { chatController: ChatController }) {
	const [chunkEntries, setChunkEntries] = createStore<{ cachedHeight: number; offset: number; message: Message }[]>(
		[]
	)
	const [chunkHeight, setChunkHeight] = createSignal(-messageMinHeight)
	const [visibleEntries, setVisibleEntries] = createStore<
		{ cachedHeight: number; offset: number; message: Message }[]
	>([])
	const [scrollTop, setScrollTop] = createSignal(0)
	const [isSticky, setSticky] = createSignal(true)

	let viewportRect: DOMRect
	let scrollContainerRef!: HTMLDivElement
	let chunkCursor = 0
	let entriesSinceUnsticky = 0

	const chatController = props.chatController
	chatController.addEventListener('message', e => addMessage(e.detail))

	function addMessage(message: Message) {
		// TODO use ResizeObserver to observe message height changes and update offsets

		if (!isSticky()) {
			entriesSinceUnsticky++

			if (entriesSinceUnsticky > 10) {
				return
			}
		}

		// Chunk cursor is head index of messagesDatastore,
		//  we can get next or previous chunk by using cursor.
		chunkCursor++

		// Add the new message to the component
		setChunkEntries([
			...chunkEntries.slice(-maxMessagesInChunk + 1),
			{
				// Calculated cached height of message
				cachedHeight: messageMinHeight,
				offset: chunkHeight() + messageMinHeight,
				message
			}
		])

		// Update the total height of all messages
		const newTotalStackHeight = chunkHeight() + messageMinHeight // TODO can we get calculated height of message here?
		setChunkHeight(newTotalStackHeight)

		if (isSticky()) {
			scrollContainerRef.scrollTop = newTotalStackHeight
			setScrollTop(newTotalStackHeight)
			updateVisibleEntries()
		}
	}

	function updateVisibleEntries() {
		const scrollY = scrollTop()
		const endIndex = Math.max(0, chunkEntries.findLastIndex(entry => entry.offset < scrollY) + 1)
		const startIndex = Math.max(0, endIndex - maxMessagesInView)

		setVisibleEntries(chunkEntries.slice(startIndex, endIndex))
	}

	function handleScroll(scrollTop: number) {
		if (!viewportRect) viewportRect = scrollContainerRef.getBoundingClientRect()

		if (scrollTop + viewportRect.height <= chunkHeight() - 3) {
			setSticky(false)
			setScrollTop(scrollTop + viewportRect.height)
		} else {
			setSticky(true)
			scrollContainerRef.scrollTop = chunkHeight()
			setScrollTop(chunkHeight())
		}

		updateVisibleEntries()
	}

	return (
		<div
			ref={scrollContainerRef}
			class="scrollContainer"
			onScroll={e => handleScroll(e.currentTarget.scrollTop)}
			style={{ height: '100%', 'overflow-y': 'auto', contain: 'strict' }}>
			<div /* used as a spacer to mimic full height of the entire message stack */
				style={{ height: chunkHeight() + 'px' }}>
				<For each={visibleEntries}>
					{(entry, i) => {
						// const totalVisibleMessages = visibleMessages().length
						// return <MessageComponent {...entry.message} offset={indexedOffsets()[i()] || 0} />
						return <MessageComponent {...entry.message} offset={entry.offset || 0} />
					}}
				</For>
			</div>
		</div>
	)
}
