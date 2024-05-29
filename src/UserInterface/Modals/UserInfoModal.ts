import type { UserChannelInfo, UserInfo } from '../../NetworkInterfaces/AbstractNetworkInterface'
import type { Toaster } from '../../Classes/Toaster'
import { SteppedInputSliderComponent } from '../Components/SteppedInputSliderComponent'
import { log, error, REST, parseHTML, cleanupHTML, formatRelativeTime } from '../../utils'
import { AbstractModal, ModalGeometry } from './AbstractModal'
import { BadgeFactory } from '../../Factories/BadgeFactory'

export class UserInfoModal extends AbstractModal {
	private rootContext: RootContext
	private session: Session

	private toaster: Toaster
	private username: string
	private userInfo?: UserInfo
	private userChannelInfo?: UserChannelInfo

	private badgesEl?: HTMLElement
	private messagesHistoryEl?: HTMLElement

	private actionFollowEl?: HTMLElement
	private actionMuteEl?: HTMLElement
	private actionReportEl?: HTMLElement
	private timeoutPageEl?: HTMLElement
	private statusPageEl?: HTMLElement

	private modActionButtonBanEl?: HTMLElement
	private modActionButtonTimeoutEl?: HTMLElement
	private modActionButtonVIPEl?: HTMLElement
	private modActionButtonModEl?: HTMLElement
	private modLogsMessagesEl?: HTMLElement
	private modLogsPageEl?: HTMLElement

	private timeoutSliderComponent?: SteppedInputSliderComponent

	private messagesHistoryCursor: number | null = 0
	private isLoadingMessages = false

	constructor(
		rootContext: RootContext,
		session: Session,
		{
			toaster
		}: {
			toaster: Toaster
		},
		username: string
	) {
		const geometry: ModalGeometry = {
			width: '340px',
			position: 'chat-top'
		}

		super('user-info', geometry)

		this.rootContext = rootContext
		this.session = session
		this.toaster = toaster
		this.username = username
	}

	init() {
		super.init()
		return this
	}

	async render() {
		super.render()

		const { channelData } = this.session
		const is_moderator =
			channelData.me.is_super_admin || channelData.me.is_moderator || channelData.me.is_broadcaster

		// TODO override the modal position and size to top of chat? Keep in mind other platforms

		await this.updateUserInfo()

		const userInfo: UserInfo = this.userInfo || {
			id: '',
			username: 'Error',
			createdAt: null,
			isFollowing: false,
			profilePic: '',
			bannerImg: ''
		}
		const userChannelInfo: UserChannelInfo = this.userChannelInfo || {
			id: '',
			username: 'Error',
			channel: 'Error',
			badges: [],
			followingSince: null
		}

		const today = +new Date(new Date().toLocaleDateString())

		let formattedAccountDate
		if (userInfo.createdAt) {
			const createdDate = userInfo.createdAt.toLocaleDateString()
			const createdDateUnix = +new Date(createdDate)

			if (+createdDateUnix === today) formattedAccountDate = 'Today'
			else if (+createdDateUnix === today - 24 * 60 * 60 * 1000) formattedAccountDate = 'Yesterday'
			else formattedAccountDate = formatRelativeTime(userInfo.createdAt)
		}

		let formattedJoinDate
		if (userChannelInfo.followingSince) {
			const joinedDate = userChannelInfo.followingSince.toLocaleDateString()
			const joinedDateUnix = +new Date(joinedDate)

			if (+joinedDateUnix === today) formattedJoinDate = 'Today'
			else if (+joinedDateUnix === today - 24 * 60 * 60 * 1000) formattedJoinDate = 'Yesterday'
			else formattedJoinDate = formatRelativeTime(userChannelInfo.followingSince)
		}

		const element = parseHTML(
			cleanupHTML(`
				<div class="ntv__user-info-modal__header" ${
					userInfo.bannerImg ? `style="--background: url('${userInfo.bannerImg}')"` : ''
				}>
					<div class="ntv__user-info-modal__header__actions">
					
					</div>
					<div class="ntv__user-info-modal__header__banner">
						<img src="${userInfo.profilePic}">
						<h4>${userInfo.username}</h4>
						<p>
							${
								formattedAccountDate
									? `<span>
								<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0.5 0 24 21">
									<g fill="none" stroke="currentColor" stroke-width="1.5">
										<path d="M12 10H18C19.1046 10 20 10.8954 20 12V21H12" />
										<path d="M12 21H4V12C4 10.8954 4.89543 10 6 10H12" />
										<path stroke-linecap="round" stroke-linejoin="round" d="M12 10V8" />
										<path d="M4 16H5C7 16 8.5 14 8.5 14C8.5 14 10 16 12 16C14 16 15.5 14 15.5 14C15.5 14 17 16 19 16H20" />
									</g>
									<path fill="currentColor" d="M14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 12 0 12 0C12 0 14 2.89543 14 4Z" />
								</svg> Account created: ${formattedAccountDate}</span>`
									: ''
							}

							${
								formattedJoinDate
									? `<span>
								<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32">
									<path fill="currentColor" d="M32 14h-4v-4h-2v4h-4v2h4v4h2v-4h4zM12 4a5 5 0 1 1-5 5a5 5 0 0 1 5-5m0-2a7 7 0 1 0 7 7a7 7 0 0 0-7-7m10 28h-2v-5a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v5H2v-5a7 7 0 0 1 7-7h6a7 7 0 0 1 7 7z" />
								</svg> Followed since: ${formattedJoinDate}</span>`
									: ''
							}
						</p>
					</div>
				</div>
				<div class="ntv__user-info-modal__badges">${userChannelInfo.badges.length ? 'Badges: ' : ''}${userChannelInfo.badges
				.map(BadgeFactory.getBadge)
				.join('')}</div>
				<div class="ntv__user-info-modal__actions">
					<button class="ntv__button">${userInfo.isFollowing ? 'Unfollow' : 'Follow'}</button>
					<button class="ntv__button">${this.rootContext.usersManager.hasMutedUser(userInfo.id) ? 'Unmute' : 'Mute'}</button>
					<!--<button class="ntv__button">Report</button>-->
				</div>
				<div class="ntv__user-info-modal__mod-actions"></div>
				<div class="ntv__user-info-modal__timeout-page"></div>
				<div class="ntv__user-info-modal__status-page"></div>
				<div class="ntv__user-info-modal__mod-logs"></div>
				<div class="ntv__user-info-modal__mod-logs-page"></div>
			`)
		)

		this.badgesEl = element.querySelector('.ntv__user-info-modal__badges') as HTMLElement

		if (is_moderator) {
			this.actionFollowEl = element.querySelector(
				'.ntv__user-info-modal__actions .ntv__button:nth-child(1)'
			) as HTMLElement
			this.actionMuteEl = element.querySelector(
				'.ntv__user-info-modal__actions .ntv__button:nth-child(2)'
			) as HTMLElement
			this.actionReportEl = element.querySelector(
				'.ntv__user-info-modal__actions .ntv__button:nth-child(3)'
			) as HTMLElement
			this.timeoutPageEl = element.querySelector('.ntv__user-info-modal__timeout-page') as HTMLElement
			this.statusPageEl = element.querySelector('.ntv__user-info-modal__status-page') as HTMLElement

			this.modActionButtonBanEl = parseHTML(
				cleanupHTML(`
			<button class="ntv__icon-button" alt="Ban ${userInfo.username}" ${userChannelInfo.banned ? 'active' : ''}>
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

			this.updateModStatusPage()

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
		}

		this.modalBodyEl.appendChild(element)
	}

	attachEventHandlers() {
		super.attachEventHandlers()

		this.actionFollowEl?.addEventListener('click', this.clickFollowHandler.bind(this))

		this.actionMuteEl?.addEventListener('click', this.clickMuteHandler.bind(this))

		this.actionReportEl?.addEventListener('click', () => {
			log('Report button clicked')
		})

		this.modActionButtonBanEl?.addEventListener('click', this.clickBanHandler.bind(this))
		this.modActionButtonTimeoutEl?.addEventListener('click', this.clickTimeoutHandler.bind(this))
		this.modActionButtonVIPEl?.addEventListener('click', this.clickVIPHandler.bind(this))

		this.modActionButtonModEl?.addEventListener('click', () => {
			log('Mod button clicked')
		})

		this.modLogsMessagesEl?.addEventListener('click', this.clickMessagesHistoryHandler.bind(this))
	}

	async clickFollowHandler() {
		log('Follow button clicked')

		const { networkInterface } = this.rootContext
		const { userInfo } = this
		if (!userInfo) return

		this.actionFollowEl!.classList.add('ntv__button--disabled')

		if (userInfo.isFollowing) {
			try {
				await networkInterface.unfollowUser(this.username)
				userInfo.isFollowing = false
				this.actionFollowEl!.textContent = 'Follow'
			} catch (err: any) {
				if (err.errors && err.errors.length > 0) {
					this.toaster.addToast('Failed to follow user: ' + err.errors.join(' '), 6_000, 'error')
				} else if (err.message) {
					this.toaster.addToast('Failed to follow user: ' + err.message, 6_000, 'error')
				} else {
					this.toaster.addToast('Failed to follow user, reason unknown', 6_000, 'error')
				}
			}
		} else {
			try {
				await networkInterface.followUser(this.username)
				userInfo.isFollowing = true
				this.actionFollowEl!.textContent = 'Unfollow'
			} catch (err: any) {
				if (err.errors && err.errors.length > 0) {
					this.toaster.addToast('Failed to unfollow user: ' + err.errors.join(' '), 6_000, 'error')
				} else if (err.message) {
					this.toaster.addToast('Failed to unfollow user: ' + err.message, 6_000, 'error')
				} else {
					this.toaster.addToast('Failed to unfollow user, reason unknown', 6_000, 'error')
				}
			}
		}

		this.actionFollowEl!.classList.remove('ntv__button--disabled')
	}

	async clickMuteHandler() {
		const { userInfo } = this
		if (!userInfo) return

		const { id, username } = userInfo
		const { usersManager } = this.rootContext

		const user = usersManager.getUserById(id)
		if (!user) return

		if (user.muted) {
			log('Unmuting user:', username)
			usersManager.unmuteUserById(user.id)
			this.actionMuteEl!.textContent = 'Mute'
		} else {
			log('Muting user:', username)
			usersManager.muteUserById(user.id)
			this.actionMuteEl!.textContent = 'Unmute'
		}
	}

	async clickTimeoutHandler() {
		log('Timeout button clicked')

		const { timeoutPageEl } = this
		if (!timeoutPageEl) return

		timeoutPageEl.innerHTML = ''

		if (this.timeoutSliderComponent) {
			delete this.timeoutSliderComponent
			return
		}

		// Stepped input slider for timeout duration increasing time in steps (5 minutes, 15 minutes, 1 hour, 1day, 1week)
		const timeoutWrapperEl = parseHTML(
			cleanupHTML(`
			<div class="ntv__user-info-modal__timeout-page__wrapper">
				<div></div>
				<button class="ntv__button">></button>
				<textarea placeholder="Reason" rows="1" capture-focus></textarea>
			</div>`),
			true
		) as HTMLElement

		timeoutPageEl.appendChild(timeoutWrapperEl)

		const rangeWrapperEl = timeoutWrapperEl.querySelector(
			'.ntv__user-info-modal__timeout-page__wrapper div'
		) as HTMLElement

		this.timeoutSliderComponent = new SteppedInputSliderComponent(
			rangeWrapperEl,
			['5 minutes', '15 minutes', '1 hour', '1 day', '1 week'],
			[5, 15, 60, 60 * 24, 60 * 24 * 7]
		).init()

		const buttonEl = timeoutWrapperEl.querySelector('button') as HTMLElement
		buttonEl.addEventListener('click', async () => {
			if (!this.timeoutSliderComponent) return

			const duration = this.timeoutSliderComponent.getValue()
			const reason = (timeoutWrapperEl.querySelector('textarea') as HTMLTextAreaElement).value

			timeoutPageEl.setAttribute('disabled', '')

			try {
				await this.rootContext.networkInterface.sendCommand({
					name: 'timeout',
					args: [this.username, duration, reason]
				})
				await this.updateUserInfo()
			} catch (err: any) {
				if (err.errors && err.errors.length > 0) {
					this.toaster.addToast('Failed to timeout user: ' + err.errors.join(' '), 6_000, 'error')
				} else if (err.message) {
					this.toaster.addToast('Failed to timeout user: ' + err.message, 6_000, 'error')
				} else {
					this.toaster.addToast('Failed to timeout user, reason unknown', 6_000, 'error')
				}

				timeoutPageEl.removeAttribute('disabled')
				return
			}

			this.modActionButtonBanEl!.setAttribute('active', '')

			timeoutPageEl.innerHTML = ''
			timeoutPageEl.removeAttribute('disabled')
			delete this.timeoutSliderComponent

			this.updateModStatusPage()

			log(`Successfully timed out user: ${this.username} for ${duration} minutes`)
		})
	}

	async clickVIPHandler() {
		log('VIP button clicked')

		const { networkInterface } = this.rootContext
		const { userInfo } = this
		if (!userInfo) return

		// this.modActionButtonVIPEl!.classList.add('ntv__icon-button--disabled')

		// if (userInfo.vip) {
		// 	log(`Attempting to remove VIP from user: ${userInfo.username}..`)

		// 	try {
		// 		await networkInterface.sendCommand({ name: 'unvip', args: [userInfo.username] })
		// 		log('Successfully removed VIP from user:', userInfo.username)
		// 	} catch (err: any) {
		// 		if (err.errors && err.errors.length > 0) {
		// 			this.toaster.addToast('Failed to remove VIP from user: ' + err.errors.join(' '), 6_000, 'error')
		// 		} else if (err.message) {
		// 			this.toaster.addToast('Failed to remove VIP from user: ' + err.message, 6_000, 'error')
		// 		} else {
		// 			this.toaster.addToast('Failed to remove VIP from user, reason unknown', 6_000, 'error')
		// 		}

		// 		this.modActionButtonVIPEl!.classList.remove('ntv__icon-button--disabled')
		// 		return
		// 	}

		// 	delete userInfo.vip
		// } else {
		// 	log(`Attempting to give VIP to user: ${userInfo.username}..`)

		// 	try {
		// 		await networkInterface.sendCommand({ name: 'vip', args: [userInfo.username] })
		// 		log('Successfully gave VIP to user:', userInfo.username)
		// 	} catch (err: any) {
		// 		if (err.errors && err.errors.length > 0) {
		// 			this.toaster.addToast('Failed to give VIP to user: ' + err.errors.join(' '), 6_000, 'error')
		// 		} else if (err.message) {
		// 			this.toaster.addToast('Failed to give VIP to user: ' + err.message, 6_000, 'error')
		// 		} else {
		// 			this.toaster.addToast('Failed to give VIP to user, reason unknown', 6_000, 'error')
		// 		}

		// 		this.modActionButtonVIPEl!.classList.remove('ntv__icon-button--disabled')
		// 		return
		// 	}

		// 	userInfo.vip = true
		// }

		// this.updateModStatusPage()
		// this.modActionButtonVIPEl!.classList.remove('ntv__icon-button--disabled')
	}

	async clickBanHandler() {
		if (this.modActionButtonBanEl!.classList.contains('ntv__icon-button--disabled')) return

		this.modActionButtonBanEl!.classList.add('ntv__icon-button--disabled')

		const { networkInterface } = this.rootContext
		const { userInfo, userChannelInfo } = this
		if (!userInfo || !userChannelInfo) return

		if (userChannelInfo.banned) {
			log(`Attempting to unban user: ${userInfo.username}..`)

			try {
				await networkInterface.sendCommand({ name: 'unban', args: [userInfo.username] })
				log('Successfully unbanned user:', userInfo.username)
			} catch (err: any) {
				if (err.errors && err.errors.length > 0) {
					this.toaster.addToast('Failed to unban user: ' + err.errors.join(' '), 6_000, 'error')
				} else if (err.message) {
					this.toaster.addToast('Failed to unban user: ' + err.message, 6_000, 'error')
				} else {
					this.toaster.addToast('Failed to unban user, reason unknown', 6_000, 'error')
				}

				this.modActionButtonBanEl!.classList.remove('ntv__icon-button--disabled')
				return
			}

			delete userChannelInfo.banned
			this.modActionButtonBanEl!.removeAttribute('active')
		} else {
			log(`Attempting to ban user: ${userInfo.username}..`)

			try {
				await networkInterface.sendCommand({ name: 'ban', args: [userInfo.username] })
				log('Successfully banned user:', userInfo.username)
			} catch (err: any) {
				if (err.errors && err.errors.length > 0) {
					this.toaster.addToast('Failed to ban user: ' + err.errors.join(' '), 6_000, 'error')
				} else if (err.message) {
					this.toaster.addToast('Failed to ban user: ' + err.message, 6_000, 'error')
				} else {
					this.toaster.addToast('Failed to ban user, reason unknown', 6_000, 'error')
				}

				// const message = err.message || 'Failed to ban user.'
				this.modActionButtonBanEl!.classList.remove('ntv__icon-button--disabled')
				return
			}

			this.modActionButtonBanEl!.setAttribute('active', '')

			await this.updateUserInfo()
		}

		this.updateModStatusPage()
		this.modActionButtonBanEl!.classList.remove('ntv__icon-button--disabled')
	}

	async clickMessagesHistoryHandler() {
		const { userInfo, modLogsPageEl } = this
		if (!userInfo || !modLogsPageEl) return

		if (modLogsPageEl.querySelector('.ntv__user-info-modal__mod-logs-page__messages[loading]')) return

		modLogsPageEl.innerHTML = ''
		this.messagesHistoryCursor = 0

		const messagesHistoryEl = (this.messagesHistoryEl = parseHTML(
			`<div class="ntv__user-info-modal__mod-logs-page__messages" loading></div>`,
			true
		) as HTMLElement)

		modLogsPageEl.appendChild(messagesHistoryEl)

		log(`Fetching user messages of ${userInfo.username}..`)
		await this.loadMoreMessagesHistory()

		messagesHistoryEl.scrollTop = 9999
		messagesHistoryEl.removeAttribute('loading')
		messagesHistoryEl.addEventListener('scroll', this.messagesScrollHandler.bind(this))
	}

	async loadMoreMessagesHistory() {
		const { networkInterface } = this.rootContext
		const { channelData, userInterface } = this.session

		const { userInfo, modLogsPageEl, messagesHistoryEl } = this
		if (!userInfo || !modLogsPageEl || !messagesHistoryEl) return

		const cursor = this.messagesHistoryCursor
		if (typeof cursor !== 'number') return

		if (this.isLoadingMessages) return
		this.isLoadingMessages = true

		let res
		try {
			res = await networkInterface.getUserMessages(channelData.channel_id, userInfo.id, cursor)
		} catch (err: any) {
			if (err.errors && err.errors.length > 0) {
				this.toaster.addToast('Failed to load user message history: ' + err.errors.join(' '), 6_000, 'error')
			} else if (err.message) {
				this.toaster.addToast('Failed to load user message history: ' + err.message, 6_000, 'error')
			} else {
				this.toaster.addToast('Failed to load user message history, reason unknown', 6_000, 'error')
			}
			messagesHistoryEl.removeAttribute('loading')
			return
		}

		this.messagesHistoryCursor = res.cursor ? +res.cursor : null

		let entriesHTML = '',
			lastDate,
			dateCursor

		for (const message of res.messages) {
			const d = new Date(message.createdAt)
			const time = ('' + d.getHours()).padStart(2, '0') + ':' + ('' + d.getMinutes()).padStart(2, '0')

			const dateString = d.getUTCFullYear() + '' + d.getUTCMonth() + '' + d.getUTCDay()
			if (lastDate && dateString !== dateCursor) {
				const formattedDate = lastDate.toLocaleDateString('en-US', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})

				dateCursor = dateString
				lastDate = d
				entriesHTML += `<div class="ntv__chat-message-separator ntv__chat-message-separator--date"><div></div><span>${formattedDate}</span><div></div></div>`
			} else if (!lastDate) {
				lastDate = d
				dateCursor = dateString
			}

			entriesHTML += `<div class="ntv__chat-message" unrendered>
				<span class="ntv__chat-message__identity">
					<span class="ntv__chat-message__timestamp">${time} </span>
					<span class="ntv__chat-message__badges"></span>
					<span class="ntv__chat-message__username" style="color:${message.sender.color}">${message.sender.username}</span>
					<span class="ntv__chat-message__separator">: </span>
				</span>
				<span class="ntv__chat-message__part">${message.content}</span>
			</div>`
		}

		if (!this.messagesHistoryCursor && lastDate) {
			const formattedDate = lastDate.toLocaleDateString('en-US', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			})

			entriesHTML += `<div class="ntv__chat-message-separator ntv__chat-message-separator--date"><div></div><span>${formattedDate}</span><div></div></div><span class="ntv__chat-message-separator ntv__chat-message-separator--start">Start of user's messages</span>`
		}

		messagesHistoryEl.append(parseHTML(cleanupHTML(entriesHTML)))

		messagesHistoryEl.querySelectorAll('.ntv__chat-message[unrendered]').forEach((messageEl: Element) => {
			messageEl.querySelectorAll('.ntv__chat-message__part').forEach((messagePartEl: Element) => {
				userInterface!.renderEmotesInElement(messagePartEl as HTMLElement)
			})
			messageEl.removeAttribute('unrendered')
		})

		this.isLoadingMessages = false
		messagesHistoryEl.removeAttribute('loading')
	}

	async messagesScrollHandler(event: Event) {
		const target = event.currentTarget as HTMLElement

		// Scrolled to top, load new messages
		const scrollTop = target.scrollTop + target.scrollHeight - target.clientHeight
		if (scrollTop < 30) this.loadMoreMessagesHistory()
	}

	async updateUserInfo() {
		const { networkInterface } = this.rootContext
		const { channelData } = this.session

		try {
			delete this.userInfo
			delete this.userChannelInfo
			this.userInfo = await networkInterface.getUserInfo(this.username)
			this.userChannelInfo = await networkInterface.getUserChannelInfo(channelData.channel_name, this.username)
			// this.userChannelInfo.badges = [
			// 	{
			// 		type: 'broadcaster',
			// 		label: 'Broadcaster',
			// 		active: true
			// 	},
			// 	{
			// 		type: 'verified',
			// 		label: 'Verified',
			// 		active: true
			// 	},
			// 	{
			// 		type: 'staff',
			// 		label: 'Staff',
			// 		active: true
			// 	},
			// 	{
			// 		type: 'Partner',
			// 		label: 'partner',
			// 		active: true
			// 	},
			// 	{
			// 		type: 'global_moderator',
			// 		label: 'Global moderator',
			// 		active: true
			// 	},
			// 	{
			// 		type: 'global_admin',
			// 		label: 'Global admin',
			// 		active: true
			// 	},
			// 	{
			// 		type: 'moderator',
			// 		label: 'Moderator',
			// 		active: true
			// 	},
			// 	{
			// 		type: 'vip',
			// 		label: 'VIP',
			// 		active: true
			// 	},
			// 	{
			// 		type: 'founder',
			// 		label: 'Founder',
			// 		active: true
			// 	},
			// 	{
			// 		type: 'og',
			// 		label: 'OG',
			// 		active: true
			// 	},
			// 	{
			// 		type: 'sidekick',
			// 		label: 'Sidekick',
			// 		active: true
			// 	},
			// 	{
			// 		type: 'subscriber',
			// 		label: 'Subscriber',
			// 		active: true
			// 	}
			// ]
		} catch (err: any) {
			if (err.errors && err.errors.length > 0) {
				this.toaster.addToast('Failed to get user info: ' + err.errors.join(' '), 6_000, 'error')
			} else if (err.message) {
				this.toaster.addToast('Failed to get user info: ' + err.message, 6_000, 'error')
			} else {
				this.toaster.addToast('Failed to get user info, reason unknown', 6_000, 'error')
			}
		}
	}

	updateModStatusPage() {
		const { userChannelInfo, statusPageEl } = this
		if (!userChannelInfo || !statusPageEl) return

		if (userChannelInfo.banned) {
			statusPageEl.innerHTML = cleanupHTML(`
				<div class="ntv__user-info-modal__status-page__banned">
					<span><b>Banned</b></span>
					<span>Reason: ${userChannelInfo.banned.reason}</span>
					<span>Expires: ${
						userChannelInfo.banned.expiresAt
							? formatRelativeTime(userChannelInfo.banned.expiresAt)
							: 'Not set'
					}</span>
				</div>
			`)
		} else {
			statusPageEl.innerHTML = ''
		}
	}
}
