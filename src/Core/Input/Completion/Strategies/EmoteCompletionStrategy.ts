import NavigatableListWindowManager from '../../../Common/NavigatableListWindowManager'
import AbstractInputCompletionStrategy from './AbstractInputCompletionStrategy'
import type { ContentEditableEditor } from '../../ContentEditableEditor'
import { error, log, parseHTML } from '../../../Common/utils'
import { Caret } from '../../../UI/Caret'

export default class EmoteCompletionStrategy extends AbstractInputCompletionStrategy {
	protected id = 'emotes'
	readonly isFullLineStrategy = false

	private start = 0
	private end = 0
	private node: Node | null = null
	private word: string | null = null
	private emoteComponent: HTMLElement | null = null

	constructor(
		protected rootContext: RootContext,
		protected session: Session,
		protected contentEditableEditor: ContentEditableEditor,
		protected navListWindowManager: NavigatableListWindowManager
	) {
		super(rootContext, session, contentEditableEditor, navListWindowManager)
	}

	shouldUseStrategy(event: KeyboardEvent | MouseEvent, contentEditableEditor: ContentEditableEditor): boolean {
		const word = Caret.getWordBeforeCaret().word
		const codepoint = word ? word.codePointAt(0) || 0 : 0
		return (
			event instanceof KeyboardEvent &&
			event.key === 'Tab' &&
			word !== null &&
			// BMP codepoints for latin special characters
			!(codepoint >= 0x0021 && codepoint <= 0x002f)
		)
	}

	maybeCreateNavWindow() {
		if (this.navWindow) return

		this.navWindow = this.navListWindowManager.createNavWindow(this.id)
		this.navWindow.addEventListener('entry-click', (event: Event) => {
			this.renderInlineCompletion()
		})
	}

	getRelevantEmotes(searchString: string) {
		const emotesManager = this.session.emotesManager

		return this.session.emotesManager.searchEmotes(searchString.substring(0, 20), 20).filter(fuseResult => {
			const emote = fuseResult.item
			const emoteSet = emotesManager.getEmoteSetByEmoteHid(emote.hid)
			if (!emoteSet) return false

			// Don't show emotes if they are not enabled in the menu
			// Don't show subscribers only emotes if user is not subscribed
			return (
				emoteSet.enabledInMenu &&
				(!emote.isSubscribersOnly || (emote.isSubscribersOnly && emoteSet.isSubscribed))
			)
		})
	}

	updateCompletionEntries() {
		const { word, start, end, startOffset, node } = Caret.getWordBeforeCaret()
		if (!word) return true

		this.word = word
		this.start = start
		this.end = end
		this.node = node

		// TODO we have startOffset, maybe check for BMP codepoint and insert event.key?

		const relevantEmotes = this.getRelevantEmotes(word)
		if (!relevantEmotes.length) return true

		this.clearNavWindow()
		this.maybeCreateNavWindow()

		const { emotesManager } = this.session
		const navWindow = this.navWindow!

		// log('Search results:', searchResults)
		const emoteNames = relevantEmotes.map(result => result.item.name)
		const emoteHids = relevantEmotes.map(result => emotesManager.getEmoteHidByName(result.item.name))

		// Render emote completion entries
		for (let i = 0; i < emoteNames.length; i++) {
			const emoteName = emoteNames[i]
			const emoteHid = emoteHids[i]
			const emoteRender = emotesManager.getRenderableEmoteByHid(emoteHid!, 'ntv__emote')
			navWindow.addEntry(
				{ emoteHid },
				parseHTML(
					`<li data-emote-hid="${emoteHid}">${emoteRender}<span>${emoteName}</span></li>`,
					true
				) as HTMLElement
			)
		}

		navWindow.setSelectedIndex(0)
		this.renderInlineCompletion()
	}

	moveSelectorUp() {
		if (!this.navWindow) return error('No tab completion window to move selector up')
		this.navWindow.moveSelectorUp()
		this.renderInlineCompletion()
	}

	moveSelectorDown() {
		if (!this.navWindow) return error('No tab completion window to move selector down')
		this.navWindow.moveSelectorDown()
		this.renderInlineCompletion()
	}

	renderInlineCompletion() {
		if (!this.navWindow) return error('Tab completion window does not exist yet')

		const selectedEntry = this.navWindow.getSelectedEntry()
		if (!selectedEntry) return error('No selected entry to render completion')

		const { emoteHid } = selectedEntry as { emoteHid: string }
		if (!emoteHid) return error('No emote hid to render inline emote')

		if (this.emoteComponent) {
			this.contentEditableEditor.replaceEmote(this.emoteComponent, emoteHid)
		} else {
			if (!this.node) return error('Invalid node to restore original text')

			const range = document.createRange()
			range.setStart(this.node, this.start)
			range.setEnd(this.node, this.end)
			range.deleteContents()

			const selection = window.getSelection()
			if (selection) {
				selection.removeAllRanges()
				selection.addRange(range)
			}

			this.contentEditableEditor.normalize()
			this.emoteComponent = this.contentEditableEditor.insertEmote(emoteHid)
		}
	}

	restoreOriginalText() {
		if (this.word) {
			if (!this.emoteComponent) return error('Invalid embed node to restore original text')

			this.contentEditableEditor.replaceEmoteWithText(this.emoteComponent, this.word)
		}
	}

	handleKeyDownEvent(event: KeyboardEvent) {
		// TODO decouple it from navWindow here, so it works without navWindow as well. NavWindow should be optional.
		if (this.navWindow) {
			switch (event.key) {
				case 'Tab':
					event.preventDefault()

					// Traverse tab completion suggestions up/down depending on whether shift is held with tab
					if (event.shiftKey) {
						this.moveSelectorDown()
					} else {
						this.moveSelectorUp()
					}
					return false

				case 'ArrowUp':
					event.preventDefault()
					this.moveSelectorUp()
					return false

				case 'ArrowDown':
					event.preventDefault()
					this.moveSelectorDown()
					return false
			}
		}

		switch (event.key) {
			case 'Enter':
			case ' ':
				event.preventDefault()
				event.stopPropagation()

				return true

			case 'Backspace':
				event.preventDefault()
				event.stopImmediatePropagation()
				this.restoreOriginalText()
				return true

			case 'ArrowRight':
			case 'ArrowLeft':
				return true

			case 'Shift':
			case 'Control':
				return false

			case 'Escape':
				this.restoreOriginalText()
				return true
		}

		event.preventDefault()
		return this.updateCompletionEntries()
	}

	handleClickEvent(event: MouseEvent, clickIsInInput: boolean) {
		return true
	}

	reset() {
		super.reset()

		this.start = 0
		this.end = 0
		this.node = null
		this.word = null
		this.emoteComponent = null
	}
}
