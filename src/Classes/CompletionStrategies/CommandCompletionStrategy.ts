import { countStringOccurrences, error, eventKeyIsLetterDigitPuncSpaceChar, log, parseHTML } from '../../utils'
import { AbstractCompletionStrategy } from './AbstractCompletionStrategy'
import type { ContentEditableEditor } from '../ContentEditableEditor'
import type { PriorityEventTarget } from '../PriorityEventTarget'

type CommandDependencies = RootContext & Session

const commandsMap = [
	{
		name: 'timeout',
		command: 'timeout <username> <minutes> [reason]',
		minAllowedRole: 'moderator',
		description: 'Temporarily ban an user from chat.',
		argValidators: {
			'<username>': (arg: string) =>
				!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required',
			'<minutes>': (arg: string) => {
				const m = parseInt(arg, 10)
				return !Number.isNaN(m) && m > 0 && m < 10_080
					? null
					: 'Minutes must be a number between 1 and 10080 (7 days).'
			}
		}
	},
	{
		name: 'ban',
		command: 'ban <username> [reason]',
		minAllowedRole: 'moderator',
		description: 'Permanently ban an user from chat.',
		argValidators: {
			// Not doing a length check > 2 here because Kick doesn't do it..
			'<username>': (arg: string) => (!!arg ? null : 'Username is required')
		}
	},
	{
		name: 'user',
		command: 'user <username>',
		// minAllowedRole: 'moderator',
		description: 'Display user information.',
		argValidators: {
			'<username>': (arg: string) =>
				!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required'
		},
		execute: (deps: CommandDependencies, args: string[]) => {
			log('User command executed with args:', args)
			const { eventBus } = deps
			eventBus.publish('ntv.ui.show_modal.user_info', { username: args[0] })
		}
	},
	{
		name: 'title',
		command: 'title <title>',
		minAllowedRole: 'moderator',
		description: 'Set the stream title.',
		argValidators: {
			'<title>': (arg: string) => (!!arg ? null : 'Title is required')
		}
	},
	{
		name: 'poll',
		command: 'poll',
		minAllowedRole: 'moderator',
		description: 'Create a poll.',
		execute: (deps: CommandDependencies, args: string[]) => {
			const { eventBus } = deps
			eventBus.publish('ntv.ui.show_modal.poll')
		}
	},
	{
		name: 'polldelete',
		command: 'polldelete',
		minAllowedRole: 'moderator',
		description: 'Delete the current poll.'
	},
	// {
	// 	name: 'category',
	// 	command: 'category',
	// 	minAllowedRole: 'broadcaster',
	// 	description: 'Sets the stream category.'
	// },
	{
		name: 'slow',
		command: 'slow <on_off> [seconds]',
		minAllowedRole: 'moderator',
		description: 'Enable slow mode for chat.',
		argValidators: {
			'<on_off>': (arg: string) =>
				arg === 'on' || arg === 'off' ? null : '<on_off> must be either "on" or "off"'
		}
	},
	{
		name: 'emoteonly',
		command: 'emoteonly <on_off>',
		minAllowedRole: 'moderator',
		description: 'Enable emote party mode for chat.',
		argValidators: {
			'<on_off>': (arg: string) =>
				arg === 'on' || arg === 'off' ? null : '<on_off> must be either "on" or "off"'
		}
	},
	{
		name: 'followonly',
		command: 'followonly <on_off>',
		minAllowedRole: 'moderator',
		description: 'Enable followers only mode for chat.',
		argValidators: {
			'<on_off>': (arg: string) =>
				arg === 'on' || arg === 'off' ? null : '<on_off> must be either "on" or "off"'
		}
	},
	{
		name: 'raid',
		alias: 'host',
		command: 'raid <username>',
		minAllowedRole: 'broadcaster',
		description: "Raid someone's channel (alias for /host)",
		argValidators: {
			'<username>': (arg: string) =>
				!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required'
		}
	},
	{
		name: 'timer',
		command: 'timer <seconds/minutes/hours> [description]',
		description: 'Start a timer to keep track of the duration of something. Specify time like 30s, 2m or 1h.',
		argValidators: {
			'<seconds/minutes/hours>': (arg: string) => {
				const time = arg.match(/^(\d+)(s|m|h)$/i)
				if (!time) return 'Invalid time format. Use e.g. 30s, 2m or 1h.'
				const value = parseInt(time[1], 10)
				if (time[2] === 's' && value > 0 && value <= 3600) return null
				if (time[2] === 'm' && value > 0 && value <= 300) return null
				if (time[2] === 'h' && value > 0 && value <= 20) return null
				return 'Invalid time format. Use e.g. 30s, 2m or 1h.'
			}
		},
		execute: (deps: CommandDependencies, args: string[]) => {
			const { eventBus } = deps
			eventBus.publish('ntv.ui.timers.add', { duration: args[0], description: args[1] })
			log('Timer command executed with args:', args)
		}
	},
	{
		name: 'clear',
		command: 'clear',
		minAllowedRole: 'moderator',
		description: 'Clear the chat.'
	},
	{
		name: 'subonly',
		command: 'subonly <on_off>',
		minAllowedRole: 'moderator',
		description: 'Enable subscribers only mode for chat.',
		argValidators: {
			'<on_off>': (arg: string) =>
				arg === 'on' || arg === 'off' ? null : '<on_off> must be either "on" or "off"'
		}
	},
	{
		name: 'unban',
		command: 'unban <username>',
		minAllowedRole: 'moderator',
		description: 'Unban an user from chat.',
		argValidators: {
			'<username>': (arg: string) =>
				!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required'
		}
	},
	{
		name: 'vip',
		command: 'vip <username>',
		minAllowedRole: 'broadcaster',
		description: 'Add an user to your VIP list.',
		argValidators: {
			'<username>': (arg: string) =>
				!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required'
		}
	},
	{
		name: 'unvip',
		command: 'unvip <username>',
		minAllowedRole: 'broadcaster',
		description: 'Remove an user from your VIP list.',
		argValidators: {
			'<username>': (arg: string) =>
				!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required'
		}
	},
	{
		name: 'mod',
		command: 'mod <username>',
		minAllowedRole: 'broadcaster',
		description: 'Add an user to your moderator list.',
		argValidators: {
			'<username>': (arg: string) =>
				!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required'
		}
	},
	{
		name: 'unmod',
		command: 'unmod <username>',
		minAllowedRole: 'broadcaster',
		description: 'Remove an user from your moderator list.',
		argValidators: {
			'<username>': (arg: string) =>
				!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required'
		}
	},
	{
		name: 'og',
		command: 'og <username>',
		minAllowedRole: 'broadcaster',
		description: 'Add an user to your OG list.',
		argValidators: {
			'<username>': (arg: string) =>
				!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required'
		}
	},
	{
		name: 'unog',
		command: 'unog <username>',
		minAllowedRole: 'broadcaster',
		description: 'Remove an user from your OG list',
		argValidators: {
			'<username>': (arg: string) =>
				!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required'
		}
	},
	{
		name: 'follow',
		command: 'follow <username>',
		description: 'Follow an user.',
		argValidators: {
			'<username>': (arg: string) =>
				!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required'
		},
		execute: async (deps: CommandDependencies, args: string[]) => {
			const { networkInterface, userInterface, channelData } = deps
			const userInfo = await networkInterface.getUserChannelInfo(channelData.channelName, args[0]).catch(err => {
				userInterface?.toastError('Failed to follow user. ' + (err.message || ''))
			})
			if (!userInfo) return
			networkInterface
				.followUser(userInfo.slug)
				.then(() => userInterface?.toastSuccess('Following user.'))
				.catch(err => userInterface?.toastError('Failed to follow user. ' + (err.message || '')))
		}
	},
	{
		name: 'unfollow',
		command: 'unfollow <username>',
		description: 'Unfollow an user.',
		argValidators: {
			'<username>': (arg: string) =>
				!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required'
		},
		execute: async (deps: CommandDependencies, args: string[]) => {
			const { networkInterface, userInterface, channelData } = deps
			const userInfo = await networkInterface.getUserChannelInfo(channelData.channelName, args[0]).catch(err => {
				userInterface?.toastError('Failed to follow user. ' + (err.message || ''))
			})
			if (!userInfo) return
			networkInterface
				.unfollowUser(userInfo.slug)
				.then(() => userInterface?.toastSuccess('User unfollowed.'))
				.catch(err => userInterface?.toastError('Failed to unfollow user. ' + (err.message || '')))
		}
	},
	{
		name: 'mute',
		command: 'mute <username>',
		description: 'Mute an user.',
		argValidators: {
			'<username>': (arg: string) =>
				!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required'
		},
		execute: (deps: CommandDependencies, args: string[]) => {
			const { usersManager, userInterface } = deps
			const user = usersManager.getUserByName(args[0])
			if (!user) userInterface?.toastError('User not found.')
			else if (user.muted) userInterface?.toastError('User is already muted.')
			else usersManager.muteUserById(user.id)
		}
	},
	{
		name: 'unmute',
		command: 'unmute <username>',
		description: 'Unmute an user.',
		argValidators: {
			'<username>': (arg: string) =>
				!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required'
		},
		execute: (deps: CommandDependencies, args: string[]) => {
			const { usersManager, userInterface } = deps
			const user = usersManager.getUserByName(args[0])
			if (!user) userInterface?.toastError('User not found.')
			else if (!user.muted) userInterface?.toastError('User is not muted.')
			else usersManager.unmuteUserById(user.id)
		}
	},
	{
		name: 'host',
		command: 'host <username>',
		minAllowedRole: 'broadcaster',
		description: "Host someone's channel",
		argValidators: {
			'<username>': (arg: string) =>
				!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required'
		}
	}
]

export class CommandCompletionStrategy extends AbstractCompletionStrategy {
	private contentEditableEditor: ContentEditableEditor
	private rootContext: RootContext
	private session: Session
	protected id = 'commands'

	constructor(
		rootContext: RootContext,
		session: Session,
		{
			contentEditableEditor
		}: {
			contentEditableEditor: ContentEditableEditor
		},
		containerEl: HTMLElement
	) {
		super(containerEl)

		this.rootContext = rootContext
		this.session = session
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
		let commandEntries
		if (inputString.indexOf(' ') !== -1) {
			const foundEntry = availableCommands.find(commandEntry => commandEntry.name.startsWith(commandName))
			if (foundEntry) commandEntries = [foundEntry]
		} else {
			commandEntries = availableCommands.filter(commandEntry => commandEntry.name.startsWith(commandName))
		}

		if (!this.navWindow) this.createModal()
		else this.navWindow.clearEntries()

		if (commandEntries && commandEntries.length) {
			for (const commandEntry of commandEntries as any[]) {
				const entryEl = parseHTML(`<li><div></div><span class="subscript"></span></li>`, true) as HTMLElement
				entryEl.childNodes[1].textContent = commandEntry.description

				// Highlight color red the command arguments where the argument is invalid
				if (commandEntries.length === 1) {
					const commandParts = commandEntry.command.split(' ')
					const command = commandParts[0]
					const args = commandParts.slice(1)

					const inputParts = inputString.split(' ')
					const inputArgs = inputParts.slice(1)

					const commandEl = document.createElement('span')
					commandEl.textContent = '/' + command
					entryEl.childNodes[0].appendChild(commandEl)

					for (let i = 0; i < args.length; i++) {
						const argEl = document.createElement('span')

						const arg = args[i]
						const inputArg = inputArgs[i] || ''

						const argValidator = commandEntry?.argValidators[arg]
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
					commandEl.textContent = '/' + commandEntry.command
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

	validateInputCommand(command: string) {
		const inputParts = command.split(' ')
		const inputCommandName = inputParts[0]
		if (!inputCommandName) return 'No command provided.'

		const availableCommands = this.getAvailableCommands()
		const commandEntry = availableCommands.find(commandEntry => commandEntry.name === inputCommandName)
		if (!commandEntry) return 'Command not found.'

		const commandParts = commandEntry.command.split(' ')
		const args = commandParts.slice(1)

		const argValidators = commandEntry.argValidators as any
		if (!argValidators) return null

		const inputArgs = inputParts.slice(1)

		for (let i = 0; i < args.length; i++) {
			const arg = args[i]
			const inputArg = inputArgs[i] || ''
			const argValidator = argValidators[arg]
			if (argValidator) {
				const argIsInvalid = argValidator(inputArg)
				if (argIsInvalid) return 'Invalid argument: ' + arg
			}
		}

		return null
	}

	getAvailableCommands() {
		const channelData = this.session.networkInterface.channelData
		const is_broadcaster = channelData?.me?.isBroadcaster || false
		const is_moderator = channelData?.me?.isModerator || false

		return commandsMap.filter(commandEntry => {
			if (commandEntry.minAllowedRole === 'broadcaster') return is_broadcaster
			if (commandEntry.minAllowedRole === 'moderator') return is_moderator || is_broadcaster
			return true
		})
	}

	getParsedInputCommand(
		inputString: string
	): [{ name: string; alias?: string; args: string[] }, (typeof commandsMap)[number]] | [void] {
		const inputParts = inputString.split(' ').filter(v => v !== '')
		const inputCommandName = inputParts[0]

		const availableCommands = this.getAvailableCommands()
		const commandEntry = availableCommands.find(
			commandEntry => commandEntry.name === inputCommandName
		) as (typeof commandsMap)[number]
		if (!commandEntry) return [error('Command not found.')]

		const argCount = countStringOccurrences(commandEntry.command, '<')
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

	attemptSubmit(event: Event) {
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

		// TODO implement it as settings option whether to validate and block invalid commands, might be useful for custom commands
		const isInvalid = this.validateInputCommand(nodeData.substring(1))
		const [commandData, commandEntry] = this.getParsedInputCommand(nodeData.substring(1))

		event.stopPropagation()

		if (isInvalid || !commandData) {
			return
		}

		const { networkInterface } = this.session
		if (commandEntry && typeof commandEntry.execute === 'function') {
			commandEntry.execute({ ...this.rootContext, ...this.session }, commandData.args)
		} else {
			networkInterface
				.sendCommand(commandData)
				.then(res => {
					if (res.status?.error) {
						this.session.userInterface?.toastError(res.status.message || 'Command failed. No reason given.')
					} else if (res.error) {
						this.session.userInterface?.toastError(
							typeof res.error === 'string'
								? res.error
								: res.message || 'Command failed. No reason given.'
						)
					}
				})
				.catch(err => {
					this.session.userInterface?.toastError('Command failed. ' + (err.message || ''))
				})
		}

		contentEditableEditor.clearInput()
		this.destroy()
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

		if (event.key === 'Enter') {
			event.preventDefault()
			this.attemptSubmit(event)
		}
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

	handleSubmitButton(event: MouseEvent) {
		this.attemptSubmit(event)
	}
}
