import AbstractInputCompletionStrategy from '@core/Input/Completion/Strategies/AbstractInputCompletionStrategy'
import NavigatableListWindowManager from '@core/Common/NavigatableListWindowManager'
import type { ContentEditableEditor } from '@core/Input/ContentEditableEditor'
import { Logger } from '@core/Common/Logger'
import { BotrixSessionManager } from '.'

const logger = new Logger()
const { log, info, error } = logger.destruct()

export class BotrixInputCompletionStrategy extends AbstractInputCompletionStrategy {
	protected id = 'botrix'

	readonly isFullLineStrategy = true

	constructor(
		protected rootContext: RootContext,
		protected session: Session,
		protected contentEditableEditor: ContentEditableEditor,
		protected navListWindowManager: NavigatableListWindowManager,
		{ botrixSessionManager }: { botrixSessionManager: BotrixSessionManager }
	) {
		super(rootContext, session, contentEditableEditor, navListWindowManager)

		// botrixSessionManager.getUserShopItems().then(res => log('FLAG_0', res))
	}

	shouldUseStrategy(event: Event, contentEditableEditor: ContentEditableEditor): boolean {
		const firstChar = contentEditableEditor.getFirstCharacter()
		return (
			firstChar === '!' ||
			(event instanceof KeyboardEvent && event.key === '!' && contentEditableEditor.isInputEmpty())
		)
	}

	maybeCreateNavWindow() {
		if (this.navWindow) return

		this.navWindow = this.navListWindowManager.createNavWindow(this.id)
		this.navWindow.addEventListener('entry-click', (event: Event) => {
			this.renderInlineCompletion()
		})
	}

	updateCompletionEntries() {
		if (!this.navWindow) return error('EXT:BTX', 'MAIN', 'Tab completion window does not exist yet')
	}

	renderInlineCompletion() {
		if (!this.navWindow) return error('EXT:BTX', 'MAIN', 'Tab completion window does not exist yet')

		const selectedEntry = this.navWindow.getSelectedEntry()
		if (!selectedEntry) return error('EXT:BTX', 'MAIN', 'No selected entry to render completion')

		const { name } = selectedEntry as { name: string }
		this.contentEditableEditor.clearInput()
		this.contentEditableEditor.insertText('!' + name)
	}

	moveSelectorUp() {
		if (!this.navWindow) return error('EXT:BTX', 'MAIN', 'No tab completion window to move selector up')
		this.navWindow.moveSelectorUp()
		this.renderInlineCompletion()
	}

	moveSelectorDown() {
		if (!this.navWindow) return error('EXT:BTX', 'MAIN', 'No tab completion window to move selector down')
		this.navWindow.moveSelectorDown()
		this.renderInlineCompletion()
	}

	handleKeyDown(event: KeyboardEvent) {
		// const { contentEditableEditor } = this
		// if (event.key === 'Enter') {
		// 	event.preventDefault()
		// 	const messageContent = contentEditableEditor.getMessageContent()
		// 	const firstNode = contentEditableEditor.getInputNode().firstChild
		// 	if (!firstNode || !(firstNode instanceof Text)) {
		// 		this.destroy()
		// 		return
		// 	}
		// 	const nodeData = firstNode.data
		// 	const firstChar = nodeData[0]
		// 	if (firstChar !== '!') {
		// 		this.destroy()
		// 		return
		// 	}
		// 	event.stopPropagation()
		// 	// TODO make it possible to reply to messages as well as sending messages
		// 	// const { networkInterface } = this.session
		// 	// networkInterface
		// 	// 	.sendMessage(messageContent, true)
		// 	// 	.then(res => {
		// 	// 		if (res.status?.error) {
		// 	// 			this.session.userInterface?.toastError(
		// 	// 				res.status.message || 'Failed to send message. No reason given.'
		// 	// 			)
		// 	// 		} else if (res.error) {
		// 	// 			this.session.userInterface?.toastError(
		// 	// 				typeof res.error === 'string'
		// 	// 					? res.error
		// 	// 					: res.message || 'Failed to send message. No reason given.'
		// 	// 			)
		// 	// 		}
		// 	// 	})
		// 	// 	.catch(err => {
		// 	// 		this.session.userInterface?.toastError(
		// 	// 			'Failed to send message. ' + (err.message || 'Reason unknown.')
		// 	// 		)
		// 	// 	})
		// 	contentEditableEditor.clearInput()
		// 	this.destroy()
		// }
	}
}
