import type { UsersManager } from '../../Managers/UsersManager'
import type { ContentEditableEditor } from '../ContentEditableEditor'
import { Caret } from '../../UserInterface/Caret'
import { error, log, parseHTML } from '../../utils'
import { AbstractCompletionStrategy } from './AbstractCompletionStrategy'

export class MentionCompletionStrategy extends AbstractCompletionStrategy {
	private contentEditableEditor: ContentEditableEditor
	private rootContext: RootContext
	protected id = 'mentions'

	private start = 0
	private end = 0
	private node: Node | null = null
	private word: string | null = null
	private mentionEnd = 0

	constructor(
		rootContext: RootContext,
		{ contentEditableEditor }: { contentEditableEditor: ContentEditableEditor },
		containerEl: HTMLElement
	) {
		super(containerEl)

		this.contentEditableEditor = contentEditableEditor
		this.rootContext = rootContext
	}

	static shouldUseStrategy(event: KeyboardEvent): boolean {
		const word = Caret.getWordBeforeCaret().word
		return (event.key === '@' && !word) || (word !== null && word.startsWith('@'))
	}

	createModal() {
		super.createModal()

		this.navWindow!.addEventListener('entry-click', (event: Event) => {
			Caret.moveCaretTo(this.node!, this.mentionEnd)
			this.contentEditableEditor.insertText(' ')
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

		const searchResults = this.rootContext.usersManager.searchUsers(word.substring(1, 20), 20)
		const userNames = searchResults.map((result: any) => result.item.name)
		const userIds = searchResults.map((result: any) => result.item.id)

		if (userNames.length) {
			for (let i = 0; i < userNames.length; i++) {
				const userName = userNames[i]
				const userId = userIds[i]

				this.navWindow.addEntry(
					{ userId, userName },
					parseHTML(`<li data-user-id="${userId}"><span>@${userName}</span></li>`, true) as HTMLElement
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

	renderInlineCompletion() {
		if (!this.navWindow) return error('Tab completion window does not exist yet')
		if (!this.node) return error('Invalid node to render inline user mention')

		const entry = this.navWindow.getSelectedEntry()
		if (!entry) return error('No selected entry to render inline user mention')

		const { userId, userName } = entry as { userId: string; userName: string }
		const userMention = `@${userName}`
		this.mentionEnd = Caret.replaceTextInRange(this.node, this.start, this.end, userMention)
		Caret.moveCaretTo(this.node, this.mentionEnd)
		this.contentEditableEditor.processInputContent()
	}

	moveSelectorUp() {
		if (!this.navWindow) return error('No tab completion window to move selector up')
		this.navWindow.moveSelectorUp()
		this.restoreOriginalText()
		this.renderInlineCompletion()
	}

	moveSelectorDown() {
		if (!this.navWindow) return error('No tab completion window to move selector down')
		this.navWindow.moveSelectorDown()
		this.restoreOriginalText()
		this.renderInlineCompletion()
	}

	restoreOriginalText() {
		if (!this.node) return error('Invalid node to restore original text')

		Caret.replaceTextInRange(this.node, this.start, this.mentionEnd, this.word || '')
		Caret.moveCaretTo(this.node, this.end)
		this.contentEditableEditor.processInputContent()
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

				this.contentEditableEditor.insertText(' ')

				this.destroy()
			} else if (event.key === ' ') {
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
		this.mentionEnd = 0
		this.node = null
		this.word = null
	}
}
