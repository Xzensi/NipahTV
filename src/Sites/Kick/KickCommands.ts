import type { CommandEntry } from '@core/Common/Commands'
import { isStringNumber } from '@core/Common/utils'
import { Logger } from '@core/Common/Logger'

const logger = new Logger()
const { log, info, error } = logger.destruct()

export const KICK_COMMANDS: readonly CommandEntry[] = [
	{
		name: 'timeout',
		params: '<username> <minutes> [reason]',
		minAllowedRole: 'moderator',
		description: 'Temporarily ban an user from chat.',
		argValidators: {
			'<username>': arg => (!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required'),
			'<minutes>': arg => {
				if (!isStringNumber(arg)) return 'Minutes must be a number'

				const m = parseInt(arg, 10)
				return !Number.isNaN(m) && m > 0 && m < 10080
					? null
					: 'Minutes must be a number between 1 and 10080 (7 days)'
			}
		},
		api: {
			protocol: 'http',
			method: 'post',
			uri: (channelName, args) => `https://kick.com/api/v2/channels/${channelName}/bans`,
			data: args => ({
				banned_username: args[0],
				duration: args[1],
				reason: args.slice(2).join(' '),
				permanent: false
			}),
			errorMessage: 'Failed to timeout user.',
			successMessage: 'User has been timed out.'
		}
	},
	{
		name: 'ban',
		params: '<username> [reason]',
		minAllowedRole: 'moderator',
		description: 'Permanently ban an user from chat.',
		argValidators: {
			// Not doing a length check > 2 here because Kick doesn't do it..
			'<username>': arg => (!!arg ? null : 'Username is required')
		},
		api: {
			protocol: 'http',
			method: 'post',
			uri: (channelName, args) => `https://kick.com/api/v2/channels/${channelName}/bans`,
			data: args => {
				const data: Record<string, any> = {
					banned_username: args[0],
					permanent: true
				}
				if (args[1]) data.reason = args.slice(1).join(' ')
				return data
			},
			errorMessage: 'Failed to ban user.',
			successMessage: 'User has been banned.'
		}
	},
	{
		name: 'user',
		params: '<username>',
		// minAllowedRole: 'moderator',
		description: 'Display user information.',
		argValidators: {
			'<username>': arg => (!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required')
		},
		execute: async (deps: RootContext & Session, args) => {
			log('KICK', 'COMMANDS', 'User command executed with args:', args)
			const { eventBus } = deps
			eventBus.publish('ntv.ui.show_modal.user_info', { username: args[0] })
		}
	},
	{
		name: 'title',
		params: '<title>',
		minAllowedRole: 'moderator',
		description: 'Set the stream title.',
		argValidators: {
			'<title>': arg => (!!arg ? null : 'Title is required')
		},
		api: {
			protocol: 'http',
			method: 'post',
			uri: (channelName, args) => `https://kick.com/api/v2/channels/${channelName}/chat-commands`,
			data: args => ({ command: 'title', parameter: args.join(' ') }),
			errorMessage: 'Failed to set title.',
			successMessage: 'Title has been set.'
		}
	},
	{
		name: 'poll',
		minAllowedRole: 'moderator',
		description: 'Create a poll.',
		execute: async (deps: RootContext & Session, args) => {
			const { eventBus } = deps
			eventBus.publish('ntv.ui.show_modal.poll')
		}
	},
	{
		name: 'polldelete',
		minAllowedRole: 'moderator',
		description: 'Delete the current poll.',
		api: {
			protocol: 'http',
			method: 'delete',
			uri: (channelName, args) => `https://kick.com/api/v2/channels/${channelName}/polls`,
			errorMessage: 'Failed to delete poll.',
			successMessage: 'Poll has been deleted.'
		}
	},
	// {
	// 	name: 'category',
	// 	command: 'category',
	// 	minAllowedRole: 'broadcaster',
	// 	description: 'Sets the stream category.'
	// },
	{
		name: 'slow',
		params: '<on_off> [seconds]',
		minAllowedRole: 'moderator',
		description: 'Enable slow mode for chat. Message interval in seconds.',
		argValidators: {
			'<on_off>': arg => (arg === 'on' || arg === 'off' ? null : '<on_off> must be either "on" or "off"'),
			'[seconds]': arg =>
				!arg || (isStringNumber(arg) && parseInt(arg, 10) > 0)
					? null
					: 'Seconds must be a number greater than 0'
		},
		api: {
			protocol: 'http',
			method: 'put',
			uri: (channelName, args) => `https://kick.com/api/v2/channels/${channelName}/chatroom`,
			data: args => ({ slow_mode: args[0] === 'on', message_interval: args[1] || 6 }),
			errorMessage: 'Failed to set slow mode.',
			successMessage: 'Succesfully toggled slow mode.'
		}
	},
	{
		name: 'emoteonly',
		params: '<on_off>',
		minAllowedRole: 'moderator',
		description: 'Enable emote party mode for chat.',
		argValidators: {
			'<on_off>': arg => (arg === 'on' || arg === 'off' ? null : '<on_off> must be either "on" or "off"')
		},
		api: {
			protocol: 'http',
			method: 'put',
			uri: (channelName, args) => `https://kick.com/api/v2/channels/${channelName}/chatroom`,
			data: args => ({ emotes_mode: args[0] === 'on' }),
			errorMessage: 'Failed to set emote only mode.',
			successMessage: 'Successfully toggled emote only mode.'
		}
	},
	{
		name: 'followonly',
		params: '<on_off> [minutes]',
		minAllowedRole: 'moderator',
		description: 'Enable followers only mode for chat.',
		argValidators: {
			'<on_off>': arg => (arg === 'on' || arg === 'off' ? null : '<on_off> must be either "on" or "off"'),
			'[minutes]': arg =>
				!arg || (isStringNumber(arg) && parseInt(arg, 10) > 0)
					? null
					: 'Minutes must be a number greater than 0'
		},
		api: {
			protocol: 'http',
			method: 'put',
			uri: (channelName, args) => `https://kick.com/api/v2/channels/${channelName}/chatroom`,
			data: args => {
				if (args[1]) {
					return {
						followers_mode: args[0] === 'on',
						following_min_duration: parseInt(args[1] as string, 10)
					} as Record<string, boolean | number>
				} else {
					return { followers_mode: args[0] === 'on' }
				}
			},
			errorMessage: 'Failed to set followers only mode.',
			successMessage: 'Succesfully toggled followers only mode.'
		}
	},
	{
		name: 'raid',
		alias: 'host',
		description: "Raid someone's channel (alias for /host)"
	},
	{
		name: 'timer',
		params: '<seconds/minutes/hours> [description]',
		description: 'Start a timer to keep track of the duration of something. Specify time like 30s, 2m or 1h.',
		argValidators: {
			'<seconds/minutes/hours>': arg => {
				const time = arg.match(/^(\d+)(s|m|h)$/i)
				if (!time) return 'Invalid time format. Use e.g. 30s, 2m or 1h.'
				const value = parseInt(time[1], 10)
				if (time[2] === 's' && value > 0 && value <= 3600) return null
				if (time[2] === 'm' && value > 0 && value <= 300) return null
				if (time[2] === 'h' && value > 0 && value <= 20) return null
				return 'Invalid time format. Use e.g. 30s, 2m or 1h.'
			}
		},
		execute: async (deps: RootContext & Session, args) => {
			const { eventBus } = deps
			eventBus.publish('ntv.ui.timers.add', { duration: args[0], description: args[1] })
			log('KICK', 'COMMANDS', 'Timer command executed with args:', args)
		}
	},
	{
		name: 'clear',
		minAllowedRole: 'moderator',
		description: 'Clear the chat.',
		api: {
			protocol: 'http',
			method: 'post',
			uri: (channelName, args) => `https://kick.com/api/v2/channels/${channelName}/chat-commands`,
			data: () => ({ command: 'clear' }),
			errorMessage: 'Failed to clear chat.',
			successMessage: 'Chat has been cleared.'
		}
	},
	{
		name: 'subonly',
		params: '<on_off>',
		minAllowedRole: 'moderator',
		description: 'Enable subscribers only mode for chat.',
		argValidators: {
			'<on_off>': arg => (arg === 'on' || arg === 'off' ? null : '<on_off> must be either "on" or "off"')
		},
		api: {
			protocol: 'http',
			method: 'put',
			uri: (channelName, args) => `https://kick.com/api/v2/channels/${channelName}/chatroom`,
			data: args => ({ subscribers_mode: args[0] === 'on' }),
			errorMessage: 'Failed to set subscribers only mode.',
			successMessage: 'Successfully toggled subscribers only mode.'
		}
	},
	{
		name: 'unban',
		params: '<username>',
		minAllowedRole: 'moderator',
		description: 'Unban an user from chat.',
		argValidators: {
			'<username>': arg => (!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required')
		},
		api: {
			protocol: 'http',
			method: 'delete',
			uri: (channelName, args) => `https://kick.com/api/v2/channels/${channelName}/bans/${args[0]}`,
			errorMessage: 'Failed to unban user.',
			successMessage: 'User has been unbanned.'
		}
	},
	{
		name: 'vip',
		params: '<username>',
		minAllowedRole: 'broadcaster',
		description: 'Add an user to your VIP list.',
		argValidators: {
			'<username>': arg => (!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required')
		},
		api: {
			protocol: 'http',
			method: 'post',
			uri: (channelName, args) => `https://kick.com/api/internal/v1/channels/${channelName}/community/vips`,
			data: args => ({ username: args[0] }),
			errorMessage: 'Failed to add user as VIP.',
			successMessage: 'User has been added as VIP.'
		}
	},
	{
		name: 'unvip',
		params: '<username>',
		minAllowedRole: 'broadcaster',
		description: 'Remove an user from your VIP list.',
		argValidators: {
			'<username>': arg => (!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required')
		},
		api: {
			protocol: 'http',
			method: 'delete',
			uri: (channelName, args) =>
				`https://kick.com/api/internal/v1/channels/${channelName}/community/vips/${args[0]}`,
			errorMessage: 'Failed to remove user from VIPs.',
			successMessage: 'User has been removed from VIPs.'
		}
	},
	{
		name: 'mod',
		params: '<username>',
		minAllowedRole: 'broadcaster',
		description: 'Add an user to your moderator list.',
		argValidators: {
			'<username>': arg => (!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required')
		},
		api: {
			protocol: 'http',
			method: 'post',
			uri: (channelName, args) => `https://kick.com/api/internal/v1/channels/${channelName}/community/moderators`,
			data: args => ({ username: args[0] }),
			errorMessage: 'Failed to add user as moderator.',
			successMessage: 'User has been added as moderator.'
		}
	},
	{
		name: 'unmod',
		params: '<username>',
		minAllowedRole: 'broadcaster',
		description: 'Remove an user from your moderator list.',
		argValidators: {
			'<username>': arg => (!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required')
		},
		api: {
			protocol: 'http',
			method: 'delete',
			uri: (channelName, args) =>
				`https://kick.com/api/internal/v1/channels/${channelName}/community/moderators/${args[0]}`,
			errorMessage: 'Failed to remove user from moderators.',
			successMessage: 'User has been removed from moderators.'
		}
	},
	{
		name: 'og',
		params: '<username>',
		minAllowedRole: 'broadcaster',
		description: 'Add an user to your OG list.',
		argValidators: {
			'<username>': arg => (!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required')
		},
		api: {
			protocol: 'http',
			method: 'post',
			uri: (channelName, args) => `https://kick.com/api/internal/v1/channels/${channelName}/community/ogs`,
			data: args => ({ username: args[0] }),
			errorMessage: 'Failed to add user as OG.',
			successMessage: 'User has been added as OG.'
		}
	},
	{
		name: 'unog',
		params: '<username>',
		minAllowedRole: 'broadcaster',
		description: 'Remove an user from your OG list',
		argValidators: {
			'<username>': arg => (!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required')
		},
		api: {
			protocol: 'http',
			method: 'delete',
			uri: (channelName, args) =>
				`https://kick.com/api/internal/v1/channels/${channelName}/community/ogs/${args[0]}`,
			errorMessage: 'Failed to remove user from OG.',
			successMessage: 'User has been removed from OG.'
		}
	},
	{
		name: 'follow',
		params: '<username>',
		description: 'Follow an user.',
		argValidators: {
			'<username>': arg => (!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required')
		},
		execute: async (deps: RootContext & Session, args) => {
			const { networkInterface, channelData } = deps
			const userInfo = await networkInterface
				.getUserChannelInfo(channelData.channelName, '' + args[0])
				.catch(err => {
					throw new Error('Failed to follow user. ' + (err.message || ''))
				})
			if (!userInfo) throw new Error('Failed to follow user. User not found')
			return networkInterface
				.followUser(userInfo.slug)
				.then(() => 'Following user')
				.catch(err => {
					throw new Error('Failed to follow user. ' + (err.message || ''))
				})
		}
	},
	{
		name: 'unfollow',
		params: '<username>',
		description: 'Unfollow an user.',
		argValidators: {
			'<username>': arg => (!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required')
		},
		execute: async (deps: RootContext & Session, args) => {
			const { networkInterface, channelData } = deps
			const userInfo = await networkInterface
				.getUserChannelInfo(channelData.channelName, '' + args[0])
				.catch(err => {
					throw new Error('Failed to follow user. ' + (err.message || ''))
				})
			if (!userInfo) throw new Error('Failed to follow user. User not found')
			return networkInterface
				.unfollowUser(userInfo.slug)
				.then(() => 'User unfollowed.')
				.catch(err => {
					throw new Error('Failed to unfollow user. ' + (err.message || ''))
				})
		}
	},
	{
		name: 'mute',
		params: '<username>',
		description: 'Mute an user.',
		argValidators: {
			'<username>': arg => (!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required')
		},
		execute: async (deps: RootContext & Session, args) => {
			const { usersManager } = deps
			const user = usersManager.getUserByName('' + args[0])
			if (!user) throw new Error('User not found')
			else if (user.muted) throw new Error('User is already muted')
			else usersManager.muteUserById(user.id, deps.channelData.channelId)
			return 'User has been muted.'
		}
	},
	{
		name: 'unmute',
		params: '<username>',
		description: 'Unmute an user.',
		argValidators: {
			'<username>': arg => (!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required')
		},
		execute: async (deps: RootContext & Session, args) => {
			const { usersManager } = deps
			const user = usersManager.getUserByName('' + args[0])
			if (!user) throw new Error('User not found')
			else if (!user.muted) throw new Error('User is not muted')
			else usersManager.unmuteUserById(user.id)
			return 'User has been unmuted.'
		}
	},
	{
		name: 'host',
		params: '<username>',
		minAllowedRole: 'broadcaster',
		description: "Host someone's channel",
		argValidators: {
			'<username>': arg => (!!arg ? (arg.length > 2 ? null : 'Username is too short') : 'Username is required')
		},
		api: {
			protocol: 'http',
			method: 'post',
			uri: (channelName, args) => `https://kick.com/api/v2/channels/${channelName}/chat-commands`,
			data: args => ({ command: 'host', parameter: args[0] }),
			errorMessage: 'Failed to host channel.',
			successMessage: 'Channel has been hosted.'
		}
	}
	// {
	// 	name: 'multistream',
	// 	params: '<on_off>',
	// 	minAllowedRole: 'broadcaster',
	// 	description: 'Enable/disable multistream mode.',
	// 	argValidators: {
	// 		'<on_off>': arg => (arg === 'on' || arg === 'off' ? null : '<on_off> must be either "on" or "off"')
	// 	},
	// 	execute: async (deps: RootContext & Session, args) => {
	// 		// TODO: Implement this command
	// 	}
	// }
]
