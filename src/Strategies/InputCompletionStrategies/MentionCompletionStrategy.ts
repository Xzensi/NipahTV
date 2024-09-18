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
		return (word !== null && word[0] === '@') || (event instanceof KeyboardEvent && event.key === '@')
	}

	maybeCreateNavWindow() {
		if (this.navWindow) return

		this.navWindow = this.navListWindowManager.createNavWindow(this.id)
		this.navWindow.addEventListener('entry-click', (event: Event) => {
			this.renderInlineCompletion()
		})
	}

	getRelevantUsers(searchString: string) {
		return this.session.usersManager.searchUsers(searchString.substring(0, 20), 20)
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

		const relevantUsers = searchString.length ? this.getRelevantUsers(searchString) : []

		// Don't show completion if there's only one user and it's the same as the search string
		if (relevantUsers.length === 1 && searchString === relevantUsers[0].item.name) {
			return true
		}

		this.clearNavWindow()
		this.maybeCreateNavWindow()
		const navWindow = this.navWindow!

		if (!relevantUsers.length) {
			if (!searchString) {
				navWindow.addEntry(
					{ name: 'none', description: 'Type an username to see suggestions', type: 'info' },
					parseHTML(
						`<li class="not_found_entry"><div>Type an username to see suggestions</div></li>`,
						true
					) as HTMLElement
				)
			} else {
				navWindow.addEntry(
					{ name: 'none', description: 'User not seen in chat yet', type: 'info' },
					parseHTML(
						`<li class="not_found_entry"><div>User not seen in chat yet</div></li>`,
						true
					) as HTMLElement
				)
			}
			return false
		}

		const userNames = relevantUsers.map(result => result.item.name)
		const userIds = relevantUsers.map(result => result.item.id)

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
		if (!this.navWindow) return error('Tab completion window does not exist yet')
		if (!this.node) return error('Invalid node to render inline user mention')

		const entry = this.navWindow.getSelectedEntry()
		if (!entry) return error('No selected entry to render inline user mention')

		const { userId, userName } = entry as { userId: string; userName: string }
		const userMention = `@${userName}`

		this.end = Caret.replaceTextInRange(this.node, this.start, this.end, userMention)
		this.word = userName
		Caret.moveCaretTo(this.node, this.end)

		this.contentEditableEditor.processInputContent(true)
	}

	handleKeyDownEvent(event: KeyboardEvent) {
		if (this.navWindow) {
			switch (event.key) {
				case 'Tab':
					event.preventDefault()

					log('Tab key pressed in mention completion strategy', this.navWindow.getEntriesCount())
					if (this.navWindow.getEntriesCount() === 1) {
						this.renderInlineCompletion()
						this.contentEditableEditor.insertText(' ')
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
					this.contentEditableEditor.insertText(' ')
					return true
			}
		}

		switch (event.key) {
			case ' ':
			case 'Escape':
				return true

			case 'Backspace':
			case 'Delete':
				return false

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
			word[0] !== '@' ||
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
			if (!word || word[0] !== '@') return true

			const stopStrategy = this.updateCompletionEntries(wordBeforeCaretResult)
			this.hasNavigated = true
			return stopStrategy
		}

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
		this.hasNavigated = false
	}
}
