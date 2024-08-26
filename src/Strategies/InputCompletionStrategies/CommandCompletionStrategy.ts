import { countStringOccurrences, error, eventKeyIsLetterDigitPuncSpaceChar, log, parseHTML } from '../../utils'
import { AbstractCompletionStrategy } from './AbstractCompletionStrategy'
import type { ContentEditableEditor } from '../../Classes/ContentEditableEditor'
import { KICK_COMMANDS } from '../../Commands/KickCommands'
import { CommandEntry } from '../../Commands/Commands'

export class CommandCompletionStrategy extends AbstractCompletionStrategy {
	private contentEditableEditor: ContentEditableEditor
	protected id = 'commands'

	constructor(
		private rootContext: RootContext,
		private session: Session,
		{
			contentEditableEditor
		}: {
			contentEditableEditor: ContentEditableEditor
		},
		containerEl: HTMLElement
	) {
		super(containerEl)

		this.contentEditableEditor = contentEditableEditor
	}

	static shouldUseStrategy(event: Event, contentEditableEditor: ContentEditableEditor): boolean {
		const firstChar = contentEditableEditor.getFirstCharacter()
		return (
			firstChar === '/' ||
			(event instanceof KeyboardEvent && event.key === '/' && contentEditableEditor.isInputEmpty())
		)
	}

	createModal() {
		super.createModal()

		this.navWindow!.addEventListener('entry-click', (event: Event) => {
			this.renderInlineCompletion()
		})
	}

	updateCompletionEntries(commandName: string, inputString: string) {
		const availableCommands = this.getAvailableCommands()
		let commandEntries: CommandEntry[] | undefined

		if (inputString.indexOf(' ') !== -1) {
			const foundEntry = availableCommands.find(commandEntry => commandEntry.name === commandName)
			if (foundEntry) commandEntries = [foundEntry]
		} else {
			commandEntries = availableCommands.filter(commandEntry => commandEntry.name.startsWith(commandName))
		}

		if (!this.navWindow) this.createModal()
		else this.navWindow.clearEntries()

		if (commandEntries && commandEntries.length) {
			for (const commandEntry of commandEntries) {
				const entryEl = parseHTML(`<li><div></div><span class="subscript"></span></li>`, true) as HTMLElement
				entryEl.childNodes[1].textContent = commandEntry.description

				// Highlight color red the command arguments where the argument is invalid
				if (commandEntries.length === 1) {
					let commandEntryOrAlias: CommandEntry | undefined = commandEntry
					if (commandEntry.alias) {
						commandEntryOrAlias = availableCommands.find(n => n.name === commandEntry.alias)
					}

					if (commandEntryOrAlias) {
						const command = commandEntry.name
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
					commandEl.textContent = '/' + commandEntry.name + ' ' + commandEntry.params
					entryEl.childNodes[0].appendChild(commandEl)
				}

				this.navWindow!.addEntry(commandEntry, entryEl)
			}
		} else {
			// this.destroy()
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

	handleKeyDown(event: KeyboardEvent) {
		const { contentEditableEditor } = this

		if (event.key === 'ArrowUp') {
			event.preventDefault()
			return this.moveSelectorUp()
		} else if (event.key === 'ArrowDown') {
			event.preventDefault()
			return this.moveSelectorDown()
		}

		// const keyIsLetterDigitPuncSpaceChar = eventKeyIsLetterDigitPuncSpaceChar(event)
		// if (keyIsLetterDigitPuncSpaceChar || event.key === 'Backspace' || event.key === 'Delete') {
		// 	event.stopPropagation()
		// 	contentEditableEditor.handleKeydown(event)
		// }

		const firstNode = contentEditableEditor.getInputNode().firstChild

		if (!firstNode && event.key === '/') {
			this.updateCompletionEntries('', '/')
		} else if (!firstNode || !(firstNode instanceof Text)) {
			this.destroy()
			return
		}

		const nodeData = firstNode ? firstNode.data : '/'
		const firstChar = nodeData[0]

		if (firstChar !== '/') {
			this.destroy()
			return
		}

		// if (event.key === 'Enter') {
		// 	event.preventDefault()
		// 	this.attemptSubmit(event)
		// }
	}

	handleKeyUp(event: KeyboardEvent) {
		const { contentEditableEditor } = this

		const firstNode = contentEditableEditor.getInputNode().firstChild
		if (!firstNode || !(firstNode instanceof Text)) {
			this.destroy()
			return
		}

		const nodeData = firstNode.data
		const firstChar = nodeData[0]
		if (firstChar !== '/') {
			this.destroy()
			return
		}

		const keyIsLetterDigitPuncSpaceChar = eventKeyIsLetterDigitPuncSpaceChar(event)
		if (keyIsLetterDigitPuncSpaceChar || event.key === 'Backspace' || event.key === 'Delete') {
			let i = 1
			while (nodeData[i] && nodeData[i] !== ' ') i++

			const commandName = nodeData.substring(1, i)
			this.updateCompletionEntries(commandName, nodeData)
		}
	}
}
