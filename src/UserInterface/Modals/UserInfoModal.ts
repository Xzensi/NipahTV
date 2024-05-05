import type { AbstractNetworkInterface, UserInfo, UserMessage } from '../../NetworkInterfaces/AbstractNetworkInterface'
import type { Publisher } from '../../Classes/Publisher'
import { AbstractModal } from './AbstractModal'
import { log, error, REST, parseHTML, cleanupHTML } from '../../utils'

export class UserInfoModal extends AbstractModal {
	ENV_VARS: any
	eventBus: Publisher
	networkInterface: AbstractNetworkInterface

	channelId: string
	username: string
	userInfo?: UserInfo

	modActionButtonBanEl?: HTMLElement
	modActionButtonTimeoutEl?: HTMLElement
	modActionButtonVIPEl?: HTMLElement
	modActionButtonModEl?: HTMLElement
	modLogsMessagesEl?: HTMLElement
	modLogsPageEl?: HTMLElement

	constructor(
		{
			ENV_VARS,
			eventBus,
			networkInterface
		}: { ENV_VARS: any; eventBus: Publisher; networkInterface: AbstractNetworkInterface },
		channelData: ChannelData,
		username: string
	) {
		super('user-info')

		this.ENV_VARS = ENV_VARS
		this.eventBus = eventBus
		this.networkInterface = networkInterface
		this.username = username
		this.channelId = channelData.channel_id
	}

	init() {
		super.init()
		return this
	}

	async render() {
		super.render()

		const { username } = this

		log('Rendering UserInfo modal..')
		log('username:', username)

		// TODO override the modal position and size to top of chat? Keep in mind other platforms

		await this.updateUserInfo()

		const userInfo: UserInfo = this.userInfo || {
			id: '',
			username: 'Error',
			createdAt: 'Error',
			isFollowing: false
		}

		log('userInfo:', userInfo)

		const element = parseHTML(
			cleanupHTML(`
				<div class="ntv__user-info-modal__header">
					<div class="ntv__user-info-modal__header__actions">
					
					</div>
					<div class="ntv__user-info-modal__header__banner">
						<img src="https://dbxmjjzl5pc1g.cloudfront.net/8a7b0639-c818-44fe-9626-63fbcd0fa30f/images/user-profile-pic.png">
						<h4>${userInfo.username}</h4>
						<p><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
							<g fill="none" stroke="currentColor" stroke-width="1.5">
								<path d="M12 10H18C19.1046 10 20 10.8954 20 12V21H12" />
								<path d="M12 21H4V12C4 10.8954 4.89543 10 6 10H12" />
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 10V8" />
								<path d="M4 16H5C7 16 8.5 14 8.5 14C8.5 14 10 16 12 16C14 16 15.5 14 15.5 14C15.5 14 17 16 19 16H20" />
							</g>
							<path fill="currentColor" d="M14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 12 0 12 0C12 0 14 2.89543 14 4Z" />
						</svg> Account Created: ${userInfo.createdAt}</p>
					</div>
				</div>
				<div class="ntv__user-info-modal__actions">
					<button class="ntv__button">Follow</button>
					<button class="ntv__button">Mute</button>
					<button class="ntv__button">Report</button>
				</div>
				<div class="ntv__user-info-modal__mod-actions"></div>
				<div class="ntv__user-info-modal__mod-logs"></div>
				<div class="ntv__user-info-modal__mod-logs-page"></div>
			`)
		)

		this.modActionButtonBanEl = parseHTML(
			cleanupHTML(`
			<button class="ntv__icon-button" alt="Ban ${userInfo.username}" ${userInfo.banned ? 'active' : ''}>
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
					<path fill="currentColor" d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12S6.5 2 12 2m0 2c-1.9 0-3.6.6-4.9 1.7l11.2 11.2c1-1.4 1.7-3.1 1.7-4.9c0-4.4-3.6-8-8-8m4.9 14.3L5.7 7.1C4.6 8.4 4 10.1 4 12c0 4.4 3.6 8 8 8c1.9 0 3.6-.6 4.9-1.7" />
				</svg>
			</button>
		`),
			true
		) as HTMLElement

		this.modActionButtonTimeoutEl = parseHTML(
			cleanupHTML(`
			<button class="ntv__icon-button" alt="Timeout ${userInfo.username}">
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
					<g fill="none">
						<path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
						<path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16m0 2a1 1 0 0 1 .993.883L13 7v4.586l2.707 2.707a1 1 0 0 1-1.32 1.497l-.094-.083l-3-3a1 1 0 0 1-.284-.576L11 12V7a1 1 0 0 1 1-1" />
					</g>
				</svg>
			</button>
		`),
			true
		) as HTMLElement

		this.modActionButtonVIPEl = parseHTML(
			cleanupHTML(`
			<button class="ntv__icon-button" alt="VIP ${userInfo.username}">
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
					<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5h18M3 19h18M4 9l2 6h1l2-6m3 0v6m4 0V9h2a2 2 0 1 1 0 4h-2" />
				</svg>
			</button>
		`),
			true
		) as HTMLElement

		this.modActionButtonModEl = parseHTML(
			cleanupHTML(`
			<button class="ntv__icon-button" alt="Mod ${userInfo.username}">
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
					<path fill="currentColor" d="M12 22q-3.475-.875-5.738-3.988T4 11.1V5l8-3l8 3v5.675q-.475-.2-.975-.363T18 10.076V6.4l-6-2.25L6 6.4v4.7q0 1.175.313 2.35t.875 2.238T8.55 17.65t1.775 1.5q.275.8.725 1.525t1.025 1.3q-.025 0-.037.013T12 22m5 0q-2.075 0-3.537-1.463T12 17t1.463-3.537T17 12t3.538 1.463T22 17t-1.463 3.538T17 22m-.5-2h1v-2.5H20v-1h-2.5V14h-1v2.5H14v1h2.5z" />
				</svg>
			</button>
		`),
			true
		) as HTMLElement

		const modActionsEl = element.querySelector('.ntv__user-info-modal__mod-actions') as HTMLElement
		modActionsEl.append(
			this.modActionButtonBanEl,
			this.modActionButtonTimeoutEl,
			this.modActionButtonVIPEl,
			this.modActionButtonModEl
		)

		this.modLogsPageEl = element.querySelector('.ntv__user-info-modal__mod-logs-page') as HTMLElement
		this.modLogsMessagesEl = parseHTML(`<button>Messages</button>`, true) as HTMLElement

		const modLogsEl = element.querySelector('.ntv__user-info-modal__mod-logs') as HTMLElement
		modLogsEl.appendChild(this.modLogsMessagesEl)

		this.modalBodyEl.appendChild(element)
	}

	attachEventHandlers() {
		super.attachEventHandlers()

		this.modActionButtonBanEl?.addEventListener('click', this.clickBanHandler.bind(this))

		this.modActionButtonTimeoutEl?.addEventListener('click', () => {
			log('Timeout button clicked')
		})

		this.modActionButtonVIPEl?.addEventListener('click', () => {
			log('BIP button clicked')
		})

		this.modActionButtonModEl?.addEventListener('click', () => {
			log('Mod button clicked')
		})

		this.modLogsMessagesEl?.addEventListener('click', this.clickMessagesHandler.bind(this))
	}

	async clickBanHandler() {
		if (this.modActionButtonBanEl!.classList.contains('ntv__icon-button--disabled')) return

		this.modActionButtonBanEl!.classList.add('ntv__icon-button--disabled')

		const { networkInterface, userInfo } = this
		if (!userInfo) return

		if (userInfo.banned) {
			log(`Attempting to unban user: ${userInfo.username}..`)

			try {
				await networkInterface.sendCommand({ name: 'unban', args: [userInfo.username] })
				log('Successfully unbanned user:', userInfo.username)
			} catch (err) {
				// TODO show error message toast
				error('Failed to unban user:', err)
				this.modActionButtonBanEl!.classList.remove('ntv__icon-button--disabled')
				return
			}

			delete userInfo.banned
			this.modActionButtonBanEl!.removeAttribute('active')
		} else {
			log(`Attempting to ban user: ${userInfo.username}..`)

			try {
				await networkInterface.sendCommand({ name: 'ban', args: [userInfo.username] })
				log('Successfully banned user:', userInfo.username)
			} catch (err: any) {
				// TODO show error message toast
				error('Failed to ban user:', err)
				// const message = err.message || 'Failed to ban user.'
				this.modActionButtonBanEl!.classList.remove('ntv__icon-button--disabled')
				return
			}

			this.modActionButtonBanEl!.setAttribute('active', '')

			await this.updateUserInfo()
		}

		this.modActionButtonBanEl!.classList.remove('ntv__icon-button--disabled')
	}

	async clickMessagesHandler() {
		const { networkInterface, userInfo, modLogsPageEl } = this
		if (!userInfo || !modLogsPageEl) return

		modLogsPageEl.innerHTML = ''
		const messagesEl = parseHTML(
			`<div class="ntv__user-info-modal__mod-logs-page__messages" loading></div>`,
			true
		) as HTMLElement

		modLogsPageEl.appendChild(messagesEl)

		let messages
		try {
			log(`Getting user messages of ${userInfo.username}..`)
			messages = await networkInterface.getUserMessages(this.channelId, userInfo.id)
			log('Successfully received user messages')
		} catch (err) {
			// TODO show error message toast
			error('Failed to get user messages:', err)
			return
		}

		messagesEl.removeAttribute('loading')
		messagesEl.innerHTML = messages
			.map(message => {
				const d = new Date(message.createdAt)
				const time = ('' + d.getHours()).padStart(2, '0') + ':' + ('' + d.getMinutes()).padStart(2, '0')
				return cleanupHTML(`
					<div class="ntv__chat-message">
						<span class="ntv__chat-message__identity">
							<span class="ntv__chat-message__timestamp">${time} </span>
							<span class="ntv__chat-message__badges"></span>
							<span class="ntv__chat-message__username" style="color:${message.sender.color}">${message.sender.username}</span>
							<span class="ntv__chat-message__separator">: </span>
						</span>
						<span class="ntv__chat-message__part">${message.content}</span>
					</div>`)
			})
			.join('')

		messagesEl.scrollTop = 9999
	}

	async updateUserInfo() {
		try {
			delete this.userInfo
			this.userInfo = await this.networkInterface.getUserInfo(this.username)
		} catch (err) {
			// TODO show error message toast
			error('Failed to get user info:', err)
		}
	}
}
