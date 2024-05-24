import { AbstractComponent } from './AbstractComponent'
import { error, cleanupHTML, parseHTML } from '../../utils'

export class EmoteMenuButtonComponent extends AbstractComponent {
	rootContext: RootContext
	element?: HTMLElement
	footerLogoBtnEl?: HTMLElement

	constructor(rootContex: RootContext) {
		super()

		this.rootContext = rootContex
	}

	render() {
		// Delete any existing footer logo button, in case cached page got loaded somehow
		document.querySelector('.ntv__emote-menu-button')?.remove()

		const basePath = RESOURCE_ROOT + 'assets/img/btn'
		const filename = this.getFile()

		this.element = parseHTML(
			cleanupHTML(`
				<div class="ntv__emote-menu-button">
					<img class="${filename.toLowerCase()}" src="${basePath}/${filename}.png" draggable="false" alt="Nipah">
				</div>
			`),
			true
		) as HTMLElement
		this.footerLogoBtnEl = this.element.querySelector('img')!

		document.querySelector('#chatroom-footer .send-row')?.prepend(this.element)
	}

	attachEventHandlers() {
		const { eventBus } = this.rootContext

		eventBus.subscribe('ntv.settings.change.shared.chat.emote_menu.appearance.button_style', () => {
			if (!this.footerLogoBtnEl) return error('Footer logo button not found, unable to set logo src')
			const filename = this.getFile()
			this.footerLogoBtnEl.setAttribute('src', RESOURCE_ROOT + `assets/img/btn/${filename}.png`)
			this.footerLogoBtnEl.className = filename.toLowerCase()
		})

		this.footerLogoBtnEl?.addEventListener('click', () => {
			eventBus.publish('ntv.ui.footer.click')
		})
	}

	getFile() {
		const buttonStyle = this.rootContext.settingsManager.getSetting(
			'shared.chat.emote_menu.appearance.button_style'
		)
		let file = 'Nipah'

		switch (buttonStyle) {
			case 'nipahtv':
				file = 'NipahTV'
				break
			case 'ntv':
				file = 'NTV'
				break
			case 'ntv_3d':
				file = 'NTV_3D'
				break
			case 'ntv_3d_rgb':
				file = 'NTV_3D_RGB'
				break
			case 'ntv_3d_shadow':
				file = 'NTV_3D_RGB_Shadow'
				break
			case 'ntv_3d_shadow_beveled':
				file = 'NTV_3D_RGB_Shadow_bevel'
				break
		}

		return file
	}

	destroy() {
		this.element?.remove()
	}
}
