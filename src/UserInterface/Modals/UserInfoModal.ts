import type { AbstractNetworkInterface, UserInfo } from '../../NetworkInterfaces/AbstractNetworkInterface'
import type { Publisher } from '../../Classes/Publisher'
import { AbstractModal } from './AbstractModal'
import { log, error, REST, parseHTML, cleanupHTML } from '../../utils'

export class UserInfoModal extends AbstractModal {
	ENV_VARS: any
	eventBus: Publisher
	networkInterface: AbstractNetworkInterface

	username: string
	userInfo?: UserInfo

	modActionButtonBanEl?: HTMLElement
	modActionButtonTimeoutEl?: HTMLElement
	modActionButtonVIPEl?: HTMLElement
	modActionButtonModEl?: HTMLElement

	constructor(
		{
			ENV_VARS,
			eventBus,
			networkInterface
		}: { ENV_VARS: any; eventBus: Publisher; networkInterface: AbstractNetworkInterface },
		username: string
	) {
		super('user-info')

		this.ENV_VARS = ENV_VARS
		this.eventBus = eventBus
		this.networkInterface = networkInterface
		this.username = username
	}

	init() {
		super.init()
		return this
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

	async render() {
		super.render()

		const { username } = this

		log('Rendering UserInfo modal..')
		log('username:', username)

		// TODO override the modal position and size to top of chat? Keep in mind other platforms

		await this.updateUserInfo()

		const userInfo: UserInfo = this.userInfo || {
			username: 'Error',
			usernameSlug: 'error',
			createdAt: 'Error',
			isFollowing: false
		}

		log('userInfo:', userInfo)

		const RESOURCE_ROOT = this.ENV_VARS.RESOURCE_ROOT
		const iconsPath = RESOURCE_ROOT + 'assets/img/icons/'

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
				<div class="ntv__user-info-modal__mod-logs">
					<button>Messages</button>
				</div>
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
					<path fill="currentColor" d="M1.05 21v-2.8q0-.825.425-1.55t1.175-1.1q1.275-.65 2.875-1.1T9.05 14t3.525.45t2.875 1.1q.75.375 1.175 1.1t.425 1.55V21zm2-2h12v-.8q0-.275-.137-.5t-.363-.35q-.9-.45-2.312-.9T9.05 16t-3.187.45t-2.313.9q-.225.125-.362.35t-.138.5zm6-6q-1.65 0-2.825-1.175T5.05 9H4.8q-.225 0-.362-.137T4.3 8.5t.138-.363T4.8 8h.25q0-1.125.55-2.025T7.05 4.55v.95q0 .225.138.363T7.55 6t.363-.137t.137-.363V4.15q.225-.075.475-.112T9.05 4t.525.038t.475.112V5.5q0 .225.138.363T10.55 6t.363-.137t.137-.363v-.95q.9.525 1.45 1.425T13.05 8h.25q.225 0 .363.138t.137.362t-.137.363T13.3 9h-.25q0 1.65-1.175 2.825T9.05 13m0-2q.825 0 1.413-.587T11.05 9h-4q0 .825.588 1.413T9.05 11m7.5 4l-.15-.75q-.15-.05-.287-.112t-.263-.188l-.7.25l-.5-.9l.55-.5v-.6l-.55-.5l.5-.9l.7.25q.1-.1.25-.175t.3-.125l.15-.75h1l.15.75q.15.05.3.125t.25.175l.7-.25l.5.9l-.55.5v.6l.55.5l-.5.9l-.7-.25q-.125.125-.262.188t-.288.112l-.15.75zm.5-1.75q.3 0 .525-.225t.225-.525t-.225-.525t-.525-.225t-.525.225t-.225.525t.225.525t.525.225m1.8-3.25l-.2-1.05q-.225-.075-.412-.187T17.9 8.5l-1.05.35l-.7-1.2l.85-.75q-.05-.125-.05-.2v-.4q0-.075.05-.2l-.85-.75l.7-1.2l1.05.35q.15-.15.338-.263t.412-.187l.2-1.05h1.4l.2 1.05q.225.075.413.188t.337.262l1.05-.35l.7 1.2l-.85.75q.05.125.05.2v.4q0 .075-.05.2l.85.75l-.7 1.2l-1.05-.35q-.15.15-.337.263t-.413.187l-.2 1.05zm.7-2.25q.525 0 .888-.363T20.8 6.5t-.363-.888t-.887-.362t-.888.363t-.362.887t.363.888t.887.362M9.05 19" />
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

		this.modalBodyEl.appendChild(element)
	}

	getSettingElement(setting: string) {}

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
	}

	async clickBanHandler() {
		if (this.modActionButtonBanEl!.classList.contains('ntv__icon-button--disabled')) return

		this.modActionButtonBanEl!.classList.add('ntv__icon-button--disabled')

		const { networkInterface, userInfo } = this
		if (!userInfo) return

		if (userInfo.banned) {
			log('Unbanning user:', userInfo.username)

			try {
				await networkInterface.sendCommand({ name: 'unban', args: [userInfo.username] })
			} catch (err) {
				// TODO show error message toast
				error('Failed to unban user:', err)
				this.modActionButtonBanEl!.classList.remove('ntv__icon-button--disabled')
				return
			}

			delete userInfo.banned
			this.modActionButtonBanEl!.removeAttribute('active')
		} else {
			log('Banning user:', userInfo.username)

			try {
				await networkInterface.sendCommand({ name: 'ban', args: [userInfo.username] })
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
}
