import NavigatableListWindowManager from '@core/Common/NavigatableListWindowManager'
import AbstractInputCompletionStrategy from './AbstractInputCompletionStrategy'
import type { ContentEditableEditor } from '@core/Input/ContentEditableEditor'
import { CommandEntry } from '@core/Common/Commands'
import { parseHTML } from '@core/Common/utils'
import { Logger } from '@core/Common/Logger'

// TODO un-hardcode this
import { KICK_COMMANDS } from '../../../../Sites/Kick/KickCommands'

const logger = new Logger()
const { log, info, error } = logger.destruct()

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

	shouldUseStrategy(event: KeyboardEvent | MouseEvent, contentEditableEditor: ContentEditableEditor): boolean {
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

	getAvailableCommands() {
		const channelData = this.session.channelData
		const is_broadcaster = channelData?.me?.isBroadcaster || false
		const is_moderator = channelData?.me?.isModerator || false

		// Filter based on the role
		let res = KICK_COMMANDS.filter(commandEntry => {
			if (commandEntry.minAllowedRole === 'broadcaster') return is_broadcaster
			if (commandEntry.minAllowedRole === 'moderator') return is_moderator || is_broadcaster
			return true
		})

		// Filter a second time to remove disallowed alias commands
		return res.filter(commandEntry => {
			if (!commandEntry.alias) return true
			const aliasCommandEntry = res.find(n => n.name === commandEntry.alias)
			if (!aliasCommandEntry) return false
			return true
		})
	}

	getRelevantCommands(availableCommands: CommandEntry[], commandName: string, hasSpace: boolean) {
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
		this.maybeCreateNavWindow()

		const navWindow = this.navWindow!
		const availableCommands = this.getAvailableCommands()
		const relevantCommands = this.getRelevantCommands(
			availableCommands,
			commandName,
			inputString.indexOf(' ') !== -1
		)

		if (!relevantCommands.length) {
			navWindow.addEntry(
				{ name: 'none', description: 'Command not found' },
				parseHTML(`<li class="not_found_entry"><div>Command not found</div></li>`, true) as HTMLElement
			)
			return
		}

		// Don't kill it here because strategy is still valid, just no completions
		// if (!relevantCommands.length) return

		for (const relevantCommand of relevantCommands) {
			const entryEl = parseHTML(`<li><div></div><span class="subscript"></span></li>`, true) as HTMLElement
			entryEl.childNodes[1].textContent = relevantCommand.description

			let aliasedCommandEntry: CommandEntry | undefined
			if (relevantCommand.alias) {
				aliasedCommandEntry = availableCommands.find(n => n.name === relevantCommand.alias)
				if (!aliasedCommandEntry) continue
			}

			// Highlight color red the command arguments where the argument is invalid
			if (relevantCommands.length === 1) {
				let args: string[] | undefined

				if (aliasedCommandEntry) {
					args = aliasedCommandEntry.params?.split(' ') || []
				} else {
					args = relevantCommand.params?.split(' ') || []
				}

				const commandName = relevantCommand.name
				const commandOrAliasEntry = aliasedCommandEntry || relevantCommand

				const inputParts = inputString.split(' ')
				const inputArgs = inputParts.slice(1)

				const commandEl = document.createElement('span')
				commandEl.textContent = '/' + commandName
				entryEl.childNodes[0].appendChild(commandEl)

				for (let i = 0; i < args.length; i++) {
					const argEl = document.createElement('span')

					const arg = args[i]
					const inputArg = inputArgs[i] || ''

					const argValidator = commandOrAliasEntry?.argValidators?.[arg]
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
			} else {
				const commandEl = document.createElement('span')
				if (aliasedCommandEntry) {
					commandEl.textContent = '/' + relevantCommand.name + ' ' + (aliasedCommandEntry.params || '')
				} else {
					commandEl.textContent = '/' + relevantCommand.name + ' ' + (relevantCommand.params || '')
				}
				entryEl.childNodes[0].appendChild(commandEl)
			}

			navWindow.addEntry(relevantCommand, entryEl)
			navWindow.setSelectedIndex(0)
		}
	}

	renderInlineCompletion() {
		if (!this.navWindow) return error('CORE', 'COMCOMS', 'Tab completion window does not exist yet')

		const selectedEntry = this.navWindow.getSelectedEntry()
		if (!selectedEntry) return error('CORE', 'COMCOMS', 'No selected entry to render completion')

		const { name } = selectedEntry as { name: string }
		this.contentEditableEditor.setInputContent('/' + name)
	}

	moveSelectorUp() {
		if (!this.navWindow) return error('CORE', 'COMCOMS', 'No tab completion window to move selector up')
		this.navWindow.moveSelectorUp()
		this.renderInlineCompletion()
	}

	moveSelectorDown() {
		if (!this.navWindow) return error('CORE', 'COMCOMS', 'No tab completion window to move selector down')
		this.navWindow.moveSelectorDown()
		this.renderInlineCompletion()
	}

	handleBlockingKeyDownEvent(event: KeyboardEvent) {
		log('CORE', 'COMCOMS', 'CommandCompletionStrategy.handleBlockingKeyDownEvent', event.key)
	}

	handleKeyDownEvent(event: KeyboardEvent) {
		const { contentEditableEditor } = this

		switch (event.key) {
			case 'ArrowUp':
				if (!this.navWindow) return false
				if (this.navWindow.getEntriesCount() <= 1) return false // Necessary to prevent blocking chat history navigation

				event.preventDefault()
				this.moveSelectorUp()
				return false

			case 'ArrowDown':
				if (!this.navWindow) return false
				if (this.navWindow.getEntriesCount() <= 1) return false // Necessary to prevent blocking chat history navigation

				event.preventDefault()
				this.moveSelectorDown()
				return false

			case 'Tab':
				if (!this.navWindow) return false

				// Traverse tab completion suggestions up/down depending on whether shift is held with tab
				if (event.shiftKey) {
					this.moveSelectorDown()
				} else {
					this.moveSelectorUp()
				}

				event.preventDefault()
				return false

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

		switch (event.key) {
			case 'ArrowUp':
			case 'ArrowDown':
			case 'Tab':
			case 'Shift':
			case 'Control':
				return false
		}

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
