import { AbstractComponent } from '../../UI/Components/AbstractComponent'
import { error, cleanupHTML, parseHTML, log } from '../../Common/utils'

export default class EmoteMenuButtonComponent extends AbstractComponent {
	// Not private because of reloadUIhackInterval
	element!: HTMLElement
	private footerLogoBtnEl?: HTMLElement

	constructor(private rootContext: RootContext, private session: Session, private placeholder: HTMLElement) {
		super()
	}

	render() {
		// Delete any existing footer logo button, in case cached page got loaded somehow
		Array.from(document.getElementsByClassName('ntv__emote-menu-button')).forEach(element => {
			element.remove()
		})

		const basePath = RESOURCE_ROOT + 'assets/img/btn'
		const file = this.getFile()

		this.element = parseHTML(
			cleanupHTML(`
				<div class="ntv__emote-menu-button">
					<img class="${file.className}" src="${RESOURCE_ROOT + file.path}" draggable="false" alt="NTV">
				</div>
			`),
			true
		) as HTMLElement
		this.footerLogoBtnEl = this.element.querySelector('img')!

		this.placeholder.replaceWith(this.element)
	}

	attachEventHandlers() {
		const { eventBus: rootEventBus } = this.rootContext
		const { eventBus } = this.session

		rootEventBus.subscribe('ntv.settings.change.chat.emote_menu.appearance.button_style', () => {
			if (!this.footerLogoBtnEl) return error('Footer logo button not found, unable to set logo src')

			const file = this.getFile()
			this.footerLogoBtnEl.setAttribute('src', RESOURCE_ROOT + file.path)
			this.footerLogoBtnEl.className = file.className
		})

		this.footerLogoBtnEl?.addEventListener('click', () => {
			if (!this.session.channelData.me.isLoggedIn) {
				this.session.userInterface?.toastError(`Please log in first to use NipahTV.`)
			}

			eventBus.publish('ntv.ui.footer.click')
		})
	}

	getFile() {
		const channelId = this.session.channelData.channelId
		const buttonStyle = this.rootContext.settingsManager.getSetting(
			channelId,
			'chat.emote_menu.appearance.button_style'
		)
		let file = 'Nipah'

		switch (buttonStyle) {
			case 'nipah':
				return {
					path: 'assets/img/btn/Nipah.png',
					className: `ntv__emote-menu-button--${buttonStyle}`
				}
			case 'nipahtv':
				return {
					path: 'assets/img/btn/NipahTV.png',
					className: `ntv__emote-menu-button--${buttonStyle}`
				}
			case 'ntv':
				return {
					path: 'assets/img/btn/NTV.png',
					className: `ntv__emote-menu-button--${buttonStyle}`
				}
			case 'logo':
				return {
					path: 'assets/img/NTV_Logo.svg',
					className: `ntv__emote-menu-button--${buttonStyle}`
				}
			case 'ntv_3d':
				return {
					path: 'assets/img/btn/NTV_3D.png',
					className: `ntv__emote-menu-button--${buttonStyle}`
				}
			case 'ntv_3d_rgb':
				return {
					path: 'assets/img/btn/NTV_3D_RGB.png',
					className: `ntv__emote-menu-button--${buttonStyle}`
				}
			case 'ntv_3d_shadow':
				return {
					path: 'assets/img/btn/NTV_3D_RGB_Shadow.png',
					className: `ntv__emote-menu-button--${buttonStyle}`
				}
			case 'ntv_3d_shadow_beveled':
			default:
				return {
					path: 'assets/img/btn/NTV_3D_RGB_Shadow_Beveled.png',
					className: `ntv__emote-menu-button--${buttonStyle}`
				}
		}
	}

	destroy() {
		this.element?.remove()
	}
}
