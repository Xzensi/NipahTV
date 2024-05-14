import type { EmotesManager } from '../../Managers/EmotesManager'
import type { ContentEditableEditor } from '../ContentEditableEditor'
import { Caret } from '../../UserInterface/Caret'
import { error, parseHTML } from '../../utils'
import { AbstractCompletionStrategy } from './AbstractCompletionStrategy'

export class EmoteCompletionStrategy extends AbstractCompletionStrategy {
	private emotesManager: EmotesManager
	private contentEditableEditor: ContentEditableEditor

	private start = 0
	private end = 0
	private node: Node | null = null
	private word: string | null = null
	private emoteComponent: HTMLElement | null = null

	constructor(
		{
			emotesManager,
			contentEditableEditor
		}: { emotesManager: EmotesManager; contentEditableEditor: ContentEditableEditor },
		containerEl: HTMLElement
	) {
		super(containerEl)

		this.emotesManager = emotesManager
		this.contentEditableEditor = contentEditableEditor
	}

	static shouldUseStrategy(event: KeyboardEvent): boolean {
		const word = Caret.getWordBeforeCaret().word
		return event.key === 'Tab' && word !== null
	}

	createModal() {
		super.createModal()

		this.navWindow!.addEventListener('entry-click', (event: Event) => {
			this.renderInlineCompletion()
			this.destroy()
		})
	}

	updateCompletionEntries() {
		if (!this.navWindow) return error('Tab completion window does not exist yet')

		const { word, start, end, node } = Caret.getWordBeforeCaret()
		if (!word) {
			this.destroy()
			return
		}

		this.word = word
		this.start = start
		this.end = end
		this.node = node

		const searchResults = this.emotesManager.searchEmotes(word.substring(0, 20), 20)
		// log('Search results:', searchResults)

		const emoteNames = searchResults.map((result: any) => result.item.name)
		const emoteHids = searchResults.map((result: any) => this.emotesManager.getEmoteHidByName(result.item.name))

		if (emoteNames.length) {
			for (let i = 0; i < emoteNames.length; i++) {
				const emoteName = emoteNames[i]
				const emoteHid = emoteHids[i]
				const emoteRender = this.emotesManager.getRenderableEmoteByHid(emoteHid, 'ntv__emote')

				this.navWindow.addEntry(
					{ emoteHid },
					parseHTML(
						`<li data-emote-hid="${emoteHid}">${emoteRender}<span>${emoteName}</span></li>`,
						true
					) as HTMLElement
				)
			}

			this.navWindow.setSelectedIndex(0)
			this.renderInlineCompletion()

			if (!this.navWindow.getEntriesCount()) {
				this.destroy()
			}
		} else {
			this.destroy()
		}
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

	handleKeyDown(event: KeyboardEvent) {
		if (this.navWindow) {
			if (event.key === 'Tab') {
				event.preventDefault()

				// Traverse tab completion suggestions up/down depending on whether shift is held with tab
				if (event.shiftKey) {
					this.moveSelectorDown()
				} else {
					this.moveSelectorUp()
				}
			} else if (event.key === 'ArrowUp') {
				event.preventDefault()

				this.moveSelectorUp()
			} else if (event.key === 'ArrowDown') {
				event.preventDefault()

				this.moveSelectorDown()
			} else if (event.key === 'ArrowRight' || event.key === 'Enter') {
				if (event.key === 'Enter') {
					event.preventDefault()
					event.stopPropagation()
				}

				this.destroy()
			} else if (event.key === ' ') {
				event.preventDefault()
				event.stopPropagation()

				this.destroy()
			} else if (event.key === 'ArrowLeft' || event.key === 'Escape') {
				this.destroy()
			} else if (event.key === 'Backspace') {
				event.preventDefault()
				event.stopImmediatePropagation()

				this.restoreOriginalText()
				this.destroy()
			} else if (event.key === 'Shift') {
				// Ignore shift key press
			} else {
				this.destroy()
			}
		} else if (event.key === 'Tab') {
			event.preventDefault()
			this.createModal()
			this.updateCompletionEntries()
		}
	}

	destroy() {
        super.destroy()

		this.start = 0
		this.end = 0
		this.node = null
		this.word = null
		this.emoteComponent = null
	}
}
