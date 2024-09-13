import { InputIntentDTO, InputExecutionStrategy } from '../InputExecutionStrategy'
import type { ContentEditableEditor } from '../../Classes/ContentEditableEditor'
import { log, error, countStringOccurrences } from '../../utils'
import { KICK_COMMANDS } from '../../Commands/KickCommands'

export default class CommandExecutionStrategy implements InputExecutionStrategy {
	constructor(private rootContext: RootContext, private session: Session) {}

	shouldUseStrategy(inputIntentDTO: InputIntentDTO): boolean {
		return inputIntentDTO.input[0] === '/'
	}

	async route(
		contentEditableEditor: ContentEditableEditor,
		inputIntentDTO: InputIntentDTO,
		dontClearInput?: boolean
	): Promise<string | void> {
		const inputString = inputIntentDTO.input

		// TODO implement it as settings option whether to validate and block invalid commands, might be useful for custom commands
		const isInvalid = this.validateInputCommand(inputString.substring(1))
		const [commandData, commandEntry] = this.getParsedInputCommand(inputString.substring(1))

		if (isInvalid) {
			throw new Error(isInvalid)
		} else if (!commandData) {
			throw new Error('Command not found.')
		}

		const { networkInterface } = this.session
		if (commandEntry && typeof commandEntry.execute === 'function') {
			return commandEntry.execute({ ...this.rootContext, ...this.session }, commandData!.args).then(() => {
				dontClearInput || contentEditableEditor.clearInput()
			})
		} else {
			log('Executing command', commandData)
			return networkInterface
				.executeCommand(commandData!.name, this.session.channelData.channelName, commandData!.args)
				.then(() => {
					dontClearInput || contentEditableEditor.clearInput()
					if (commandEntry?.api?.protocol === 'http' && commandEntry.api.successMessage)
						return commandEntry.api.successMessage
				})
				.catch(() => {
					if (commandEntry?.api?.protocol === 'http' && commandEntry.api.errorMessage)
						throw new Error(commandEntry.api.errorMessage)
				})
		}
	}

	validateInputCommand(command: string) {
		const inputParts = command.split(' ')
		const inputCommandName = inputParts[0]
		if (!inputCommandName) return 'No command provided.'

		const availableCommands = this.getAvailableCommands()
		let commandEntry = availableCommands.find(n => n.name === inputCommandName)
		if (!commandEntry) return 'Command not found.'

		if (commandEntry.alias) {
			commandEntry = availableCommands.find(n => n.name === commandEntry!.name)
			if (!commandEntry) return 'Command alias not found.'
		}

		const args = commandEntry.params?.split(' ')
		const argValidators = commandEntry.argValidators as any
		if (!argValidators || !args) return null

		const inputArgs = inputParts.slice(1)

		for (let i = 0; i < args.length; i++) {
			const arg = args[i]
			const inputArg = inputArgs[i] || ''
			const argValidator = argValidators[arg]
			if (argValidator) {
				const argIsInvalid = argValidator(inputArg)
				if (argIsInvalid) return `Invalid argument ${arg}. ${argIsInvalid}.`
			}
		}

		return null
	}

	getAvailableCommands() {
		const channelData = this.session.channelData
		const is_broadcaster = channelData?.me?.isBroadcaster || false
		const is_moderator = channelData?.me?.isModerator || false

		return KICK_COMMANDS.filter(commandEntry => {
			if (commandEntry.minAllowedRole === 'broadcaster') return is_broadcaster
			if (commandEntry.minAllowedRole === 'moderator') return is_moderator || is_broadcaster
			return true
		})
	}

	getParsedInputCommand(
		inputString: string
	): [{ name: string; alias?: string; args: string[] }, (typeof KICK_COMMANDS)[number]] | [void] {
		const inputParts = inputString.split(' ').filter(v => v !== '')
		const inputCommandName = inputParts[0]

		const availableCommands = this.getAvailableCommands()
		let commandEntry = availableCommands.find(n => n.name === inputCommandName)

		if (!commandEntry) return [error('Command not found.')]

		if (commandEntry.alias) {
			commandEntry = availableCommands.find(n => n.name === commandEntry!.name)
			if (!commandEntry) return [error('Command alias not found.')]
		}

		const argCount = countStringOccurrences(commandEntry.params || '', '<')
		if (inputParts.length - 1 > argCount) {
			const start = inputParts.slice(1, argCount + 1)
			const rest = inputParts.slice(argCount + 1).join(' ')
			return [
				{
					name: commandEntry.name,
					alias: commandEntry.alias,
					args: start.concat(rest)
				},
				commandEntry
			]
		}

		return [
			{
				name: commandEntry.name,
				alias: commandEntry.alias,
				args: inputParts.slice(1, argCount + 1)
			},
			commandEntry
		]
	}
}
