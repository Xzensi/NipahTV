import NavigatableListWindowManager from '../../Managers/NavigatableListWindowManager'
import type { ContentEditableEditor } from '../../Classes/ContentEditableEditor'
import AbstractInputCompletionStrategy from './AbstractInputCompletionStrategy'
import { error, log, parseHTML } from '../../utils'
import { Caret } from '../../UserInterface/Caret'

export default class MentionCompletionStrategy extends AbstractInputCompletionStrategy {
	protected id = 'mentions'
	readonly isFullLineStrategy = false

	private start = 0
	private end = 0
	private node: Node | null = null
	private word: string | null = null
	private mentionEnd = 0

	constructor(
		protected rootContext: RootContext,
		protected session: Session,
		protected contentEditableEditor: ContentEditableEditor,
		protected navListWindowManager: NavigatableListWindowManager
	) {
		super(rootContext, session, contentEditableEditor, navListWindowManager)
	}

	shouldUseStrategy(event: Event, contentEditableEditor: ContentEditableEditor): boolean {
		const word = Caret.getWordBeforeCaret().word
		return event instanceof KeyboardEvent && event.key === 'Tab' && word !== null && word[0] === '@'
	}

	maybeCreateNavWindow() {
		if (this.navWindow) return

		this.navWindow = this.navListWindowManager.createNavWindow(this.id)
		this.navWindow.addEventListener('entry-click', (event: Event) => {
			Caret.moveCaretTo(this.node!, this.mentionEnd)
			this.contentEditableEditor.insertText(' ')
		})
	}

	getRelevantUsers(searchString: string) {
		return this.session.usersManager.searchUsers(searchString.substring(1, 20), 20)
	}

	updateCompletionEntries() {
		const { word, start, end, node } = Caret.getWordBeforeCaret()
		if (!word) return true

		this.word = word
		this.start = start
		this.end = end
		this.node = node

		const relevantUsers = this.getRelevantUsers(word)
		if (!relevantUsers.length) return true // TODO set to false when its implemented to live search while typing

		const userNames = relevantUsers.map(result => result.item.name)
		const userIds = relevantUsers.map(result => result.item.id)

		this.clearNavWindow()
		this.maybeCreateNavWindow()

		const navWindow = this.navWindow!

		// Render mention completion entries
		for (let i = 0; i < userNames.length; i++) {
			const userName = userNames[i]
			const userId = userIds[i]
			navWindow.addEntry(
				{ userId, userName },
				parseHTML(`<li data-user-id="${userId}"><span>@${userName}</span></li>`, true) as HTMLElement
			)
		}

		navWindow.setSelectedIndex(0)
		this.renderContentEditorInlineCompletion()
	}

	renderContentEditorInlineCompletion() {
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
		this.renderContentEditorInlineCompletion()
	}

	moveSelectorDown() {
		if (!this.navWindow) return error('No tab completion window to move selector down')
		this.navWindow.moveSelectorDown()
		this.restoreOriginalText()
		this.renderContentEditorInlineCompletion()
	}

	restoreOriginalText() {
		if (!this.node) return error('Invalid node to restore original text')

		Caret.replaceTextInRange(this.node, this.start, this.mentionEnd, this.word || '')
		Caret.moveCaretTo(this.node, this.end)
		this.contentEditableEditor.processInputContent()
	}

	handleKeyDownEvent(event: KeyboardEvent) {
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
				event.preventDefault()
				event.stopPropagation()
			// Continue to ArrowRight case

			case 'ArrowRight':
				this.contentEditableEditor.insertText(' ')
				return true

			case ' ':
			case 'Arrowleft':
			case 'Escape':
				return true

			case 'Backspace':
				event.preventDefault()
				event.stopImmediatePropagation()
				this.restoreOriginalText()
				return true

			case 'Shift':
				return false
		}

		event.preventDefault()
		return this.updateCompletionEntries()
	}

	handleClickEvent(event: MouseEvent, clickIsInInput: boolean) {
		if (!this.isClickInsideNavWindow(event.target as Node)) {
			return true
		}
	}

	reset() {
		super.reset()

		this.start = 0
		this.end = 0
		this.node = null
		this.word = null
		this.mentionEnd = 0
	}
}
