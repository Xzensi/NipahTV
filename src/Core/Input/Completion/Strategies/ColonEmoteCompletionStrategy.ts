import { error, eventKeyIsLetterDigitPuncChar, log, parseHTML } from '../../../Common/utils'
import NavigatableListWindowManager from '../../../Common/NavigatableListWindowManager'
import AbstractInputCompletionStrategy from './AbstractInputCompletionStrategy'
import type { ContentEditableEditor } from '../../ContentEditableEditor'
import { Caret } from '../../../UI/Caret'

export default class ColonEmoteCompletionStrategy extends AbstractInputCompletionStrategy {
	protected id = 'colon_emotes'
	readonly isFullLineStrategy = false

	private start = 0
	private end = 0
	private node: Node | null = null
	private word: string | null = null
	private emoteComponent: HTMLElement | null = null
	private hasNavigated = false

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
		// return (event.key === ':' && word === null) || (word !== null && word[0] === ':')
		return (word !== null && word[0] === ':') || (event instanceof KeyboardEvent && event.key === ':')
	}

	maybeCreateNavWindow() {
		if (this.navWindow) return

		this.navWindow = this.navListWindowManager.createNavWindow(this.id)
		this.navWindow.addEventListener('entry-click', (event: Event) => {
			this.renderInlineCompletion()
		})
	}

	getRelevantEmotes(searchString: string) {
		if (searchString.length) {
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
		} else {
			return []
			// return this.session.emotesManager
			// 	.getAllEmotes()
			// 	.slice(0, 100)
			// 	.sort(() => 0.5 - Math.random())
			// 	.slice(0, 20)
			// 	.map(emote => ({ item: emote }))
		}
	}

	updateCompletionEntries(
		{ word, start, end, node }: ReturnType<typeof Caret.getWordBeforeCaret>,
		event?: KeyboardEvent
	) {
		const { contentEditableEditor } = this
		const isInputEmpty = contentEditableEditor.isInputEmpty()

		this.start = start
		this.end = end
		this.word = word
		this.node = node

		let searchString = ''
		if (word) {
			searchString = word.slice(1)
		} else if (!isInputEmpty) {
			return true
		}

		this.clearNavWindow()
		this.maybeCreateNavWindow()
		const navWindow = this.navWindow!

		const relevantEmotes = this.getRelevantEmotes(searchString)
		if (!relevantEmotes.length) {
			if (!searchString) {
				navWindow.addEntry(
					{ name: 'none', description: 'Type an emote name to see suggestions', type: 'info' },
					parseHTML(
						`<li class="not_found_entry"><div>Type an emote name to see suggestions</div></li>`,
						true
					) as HTMLElement
				)
			} else {
				navWindow.addEntry(
					{ name: 'none', description: 'Emote not found', type: 'info' },
					parseHTML(`<li class="not_found_entry"><div>Emote not found</div></li>`, true) as HTMLElement
				)
			}
			return false
		}

		const { emotesManager } = this.session

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

		// If completion is closed with a colon and there is a perfect match, select it
		if (event?.key === ':') {
			const perfectEmoteMatch = relevantEmotes.find(emote => emote.item.name === searchString)

			if (perfectEmoteMatch) {
				const perfectEmoteMatchIndex = relevantEmotes.indexOf(perfectEmoteMatch)

				if (perfectEmoteMatchIndex !== -1) {
					navWindow.setSelectedIndex(perfectEmoteMatchIndex)

					event.preventDefault()
					event.stopPropagation()
					this.renderInlineCompletion()

					return true
				}
			}
		}

		navWindow.setSelectedIndex(0)
	}

	moveSelectorUp() {
		if (!this.navWindow) return error('No tab completion window to move selector up')
		if (this.hasNavigated) this.navWindow.moveSelectorUp()
		else this.navWindow.setSelectedIndex(0)
		this.renderInlineCompletion()
		this.hasNavigated = true
	}

	moveSelectorDown() {
		if (!this.navWindow) return error('No tab completion window to move selector down')
		if (this.hasNavigated) this.navWindow.moveSelectorDown()
		else this.navWindow.setSelectedIndex(this.navWindow.getEntriesCount() - 1)
		this.renderInlineCompletion()
		this.hasNavigated = true
	}

	renderInlineCompletion() {
		if (!this.navWindow) return error('No tab completion window to render inline completion')

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
		if (this.navWindow) {
			switch (event.key) {
				case 'Tab':
					event.preventDefault()

					if (this.navWindow.getEntriesCount() === 1) {
						this.renderInlineCompletion()
						return true
					}

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

				case 'ArrowLeft':
				case 'ArrowRight':
					return false

				case 'Enter':
					event.preventDefault()
					event.stopPropagation()
					this.renderInlineCompletion()
					return true
			}
		}

		switch (event.key) {
			case ' ':
				return true

			case 'Backspace':
			case 'Delete':
				return false

			case 'Escape':
				this.restoreOriginalText()
				return true

			case 'Control':
			case 'Shift':
				return false
		}

		const wordBeforeCaretResult = Caret.getWordBeforeCaret()
		const { word, start, startOffset, node } = wordBeforeCaretResult

		// If caret is at start or before word
		if (word && startOffset <= start) return true

		return this.updateCompletionEntries(wordBeforeCaretResult, event)
	}

	handleKeyUpEvent(event: KeyboardEvent): boolean | void {
		switch (event.key) {
			case 'Tab':
			case 'ArrowUp':
			case 'ArrowDown':
			case 'Control':
				return false
		}

		const wordBeforeCaretResult = Caret.getWordBeforeCaret()
		const { word, start, startOffset } = wordBeforeCaretResult

		if (
			!word ||
			word[0] !== ':' ||
			// If caret is at start of word
			startOffset <= start
		)
			return true

		return this.updateCompletionEntries(wordBeforeCaretResult)
	}

	handleClickEvent(event: MouseEvent, clickIsInInput: boolean) {
		if (clickIsInInput) {
			const wordBeforeCaretResult = Caret.getWordBeforeCaret()
			const { word } = wordBeforeCaretResult
			if (!word || word[0] !== ':') return true

			const stopStrategy = this.updateCompletionEntries(wordBeforeCaretResult)
			this.hasNavigated = true
			return stopStrategy
		}

		return true
	}

	reset() {
		super.reset()

		this.start = 0
		this.end = 0
		this.node = null
		this.word = null
		this.emoteComponent = null
		this.hasNavigated = false
	}
}
