import { countStringOccurrences, error, eventKeyIsLetterDigitPuncSpaceChar, log, parseHTML } from '../../utils'
import NavigatableListWindowManager from '../../Managers/NavigatableListWindowManager'
import type { ContentEditableEditor } from '../../Classes/ContentEditableEditor'
import AbstractInputCompletionStrategy from './AbstractInputCompletionStrategy'
import { KICK_COMMANDS } from '../../Commands/KickCommands'
import { CommandEntry } from '../../Commands/Commands'

export default class CommandCompletionStrategy extends AbstractInputCompletionStrategy {
	protected id = 'commands'
	readonly isFullLineStrategy = true
	allowInlineStrategyDelegation = true

	// private handleEventInKeyUp = false

	constructor(
		protected rootContext: RootContext,
		protected session: Session,
		protected contentEditableEditor: ContentEditableEditor,
		protected navListWindowManager: NavigatableListWindowManager
	) {
		super(rootContext, session, contentEditableEditor, navListWindowManager)
	}

	shouldUseStrategy(event: Event, contentEditableEditor: ContentEditableEditor): boolean {
		const firstChar = contentEditableEditor.getFirstCharacter()
		return (
			firstChar === '/' ||
			(event instanceof KeyboardEvent && event.key === '/' && contentEditableEditor.isInputEmpty())
		)
	}

	maybeCreateNavWindow() {
		if (this.navWindow) return

		this.navWindow = this.navListWindowManager.createNavWindow(this.id)
		this.navWindow.addEventListener('entry-click', (event: Event) => {
			this.renderInlineCompletion()
		})
	}

	getRelevantCommands(commandName: string, hasSpace: boolean) {
		const availableCommands = this.getAvailableCommands()

		if (hasSpace) {
			const foundEntry = availableCommands.find(commandEntry => commandEntry.name === commandName)
			if (foundEntry) return [foundEntry]
			return []
		} else {
			if (!commandName) return availableCommands
			return availableCommands.filter(commandEntry => commandEntry.name.startsWith(commandName))
		}
	}

	getAliasedCommand(commandsList: CommandEntry[], commandName: string) {
		const commandEntry = commandsList.find(n => n.name === commandName)
		return commandEntry
	}

	updateCompletionEntries(commandName: string, inputString: string) {
		this.clearNavWindow()

		const relevantCommands = this.getRelevantCommands(commandName, inputString.indexOf(' ') !== -1)
		if (!relevantCommands.length) return

		// Don't kill it here because strategy is still valid, just no completions
		// if (!relevantCommands.length) return

		this.maybeCreateNavWindow()

		const navWindow = this.navWindow!

		for (const relevantCommand of relevantCommands) {
			const entryEl = parseHTML(`<li><div></div><span class="subscript"></span></li>`, true) as HTMLElement
			entryEl.childNodes[1].textContent = relevantCommand.description

			// Highlight color red the command arguments where the argument is invalid
			if (relevantCommands.length === 1) {
				let commandEntryOrAlias: CommandEntry | undefined = relevantCommand
				if (relevantCommand.alias) {
					commandEntryOrAlias = this.getAliasedCommand(relevantCommands, relevantCommand.alias)
				}

				if (commandEntryOrAlias) {
					const command = relevantCommand.name
					const args = commandEntryOrAlias.params?.split(' ') || []

					const inputParts = inputString.split(' ')
					const inputArgs = inputParts.slice(1)

					const commandEl = document.createElement('span')
					commandEl.textContent = '/' + command
					entryEl.childNodes[0].appendChild(commandEl)

					for (let i = 0; i < args.length; i++) {
						const argEl = document.createElement('span')

						const arg = args[i]
						const inputArg = inputArgs[i] || ''

						const argValidator = commandEntryOrAlias?.argValidators?.[arg]
						if (argValidator) {
							const argIsInvalid = argValidator(inputArg)
							if (argIsInvalid) {
								argEl.style.color = 'red'
							} else {
								argEl.style.color = 'green'
							}
						}

						argEl.textContent = ' ' + arg
						entryEl.childNodes[0].appendChild(argEl)
					}
				}
			} else {
				const commandEl = document.createElement('span')
				commandEl.textContent = '/' + relevantCommand.name + ' ' + relevantCommand.params
				entryEl.childNodes[0].appendChild(commandEl)
			}

			navWindow.addEntry(relevantCommand, entryEl)
		}
	}

	renderInlineCompletion() {
		if (!this.navWindow) return error('Tab completion window does not exist yet')

		const selectedEntry = this.navWindow.getSelectedEntry()
		if (!selectedEntry) return error('No selected entry to render completion')

		const { name } = selectedEntry as { name: string }
		this.contentEditableEditor.clearInput()
		this.contentEditableEditor.insertText('/' + name)
	}

	getAvailableCommands() {
		const channelData = this.session.networkInterface.channelData
		const is_broadcaster = channelData?.me?.isBroadcaster || false
		const is_moderator = channelData?.me?.isModerator || false

		return KICK_COMMANDS.filter(commandEntry => {
			if (commandEntry.minAllowedRole === 'broadcaster') return is_broadcaster
			if (commandEntry.minAllowedRole === 'moderator') return is_moderator || is_broadcaster
			return true
		})
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

	handleBlockingKeyDownEvent(event: KeyboardEvent) {
		log('CommandCompletionStrategy.handleBlockingKeyDownEvent', event.key)
	}

	handleKeyDownEvent(event: KeyboardEvent) {
		const { contentEditableEditor } = this

		if (event.key === 'ArrowUp') {
			if (!this.navWindow) return false

			event.preventDefault()
			this.moveSelectorUp()
			return false
		} else if (event.key === 'ArrowDown') {
			if (!this.navWindow) return false

			event.preventDefault()
			this.moveSelectorDown()
			return false
		}

		switch (event.key) {
			case 'Backspace':
			case 'Delete':
			case 'Shift':
			case 'Control':
				return false
		}

		// const keyIsLetterDigitPuncSpaceChar = eventKeyIsLetterDigitPuncSpaceChar(event)
		// if (keyIsLetterDigitPuncSpaceChar || event.key === 'Backspace' || event.key === 'Delete') {
		// 	event.stopPropagation()
		// 	contentEditableEditor.handleKeydown(event)
		// }

		let inputContent = contentEditableEditor.getMessageContent()
		// const keyIsLetterDigitPuncSpaceChar = eventKeyIsLetterDigitPuncSpaceChar(event)

		// const selection = document.getSelection()
		// const hasSelection = selection?.type === 'Range'

		// if (keyIsLetterDigitPuncSpaceChar && !event.ctrlKey && !hasSelection) {
		// 	inputContent += event.key
		// } else if (event.key === 'Space' && !hasSelection) {
		// 	inputContent += ' '
		// } else {
		// 	this.handleEventInKeyUp = true
		// 	return // Update completions in handleKeyUpEvent instead
		// }

		if (inputContent[0] !== '/' && !(!inputContent && event.key === '/')) return true

		const commandName = inputContent.substring(1).split(' ')[0]
		return this.updateCompletionEntries(commandName, inputContent)
	}

	handleKeyUpEvent(event: KeyboardEvent) {
		const { contentEditableEditor } = this

		// if (!this.handleEventInKeyUp) {
		// 	return // Already handled in handleKeyDownEvent
		// }

		// this.handleEventInKeyUp = false

		const inputContent = contentEditableEditor.getMessageContent()
		const commandName = inputContent.substring(1).split(' ')[0]

		if (inputContent[0] !== '/') return true

		return this.updateCompletionEntries(commandName, inputContent)
	}

	handleClickEvent(event: MouseEvent, clickIsInInput: boolean) {
		if (!clickIsInInput && !this.isClickInsideNavWindow(event.target as Node)) {
			return true
		}
	}

	reset() {
		super.reset()
		// this.handleEventInKeyUp = false
	}
}
