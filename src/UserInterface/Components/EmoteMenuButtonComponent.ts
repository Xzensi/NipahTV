import { SettingsManager } from '../../Managers/SettingsManager'
import { AbstractComponent } from './AbstractComponent'
import { Publisher } from '../../Classes/Publisher'
import { error, cleanupHTML } from '../../utils'

export class EmoteMenuButtonComponent extends AbstractComponent {
	ENV_VARS: any
	eventBus: Publisher
	settingsManager: SettingsManager
	$element?: JQuery<HTMLElement>
	$footerLogoBtn?: JQuery<HTMLElement>

	constructor({
		ENV_VARS,
		eventBus,
		settingsManager
	}: {
		ENV_VARS: any
		eventBus: Publisher
		settingsManager: SettingsManager
	}) {
		super()

		this.ENV_VARS = ENV_VARS
		this.eventBus = eventBus
		this.settingsManager = settingsManager
	}

	render() {
		// Delete any existing footer logo button, in case cached page got loaded somehow
		$('.nipah__emote-menu-button').remove()

		const basePath = this.ENV_VARS.RESOURCE_ROOT + '/assets/img/btn'
		const filename = this.getFile()

		this.$element = $(
			cleanupHTML(`
				<div class="nipah__emote-menu-button">
					<img class="${filename.toLowerCase()}" src="${basePath}/${filename}.png" draggable="false" alt="Nipah">
				</div>
			`)
		)
		this.$footerLogoBtn = this.$element.find('img')
		$('#chatroom-footer .send-row').prepend(this.$element)
	}

	attachEventHandlers() {
		this.eventBus.subscribe('ntv.settings.change.shared.chat.emote_menu.appearance.button_style', () => {
			if (!this.$footerLogoBtn) return error('Footer logo button not found, unable to set logo src')
			const filename = this.getFile()
			this.$footerLogoBtn.attr('src', `${this.ENV_VARS.RESOURCE_ROOT}/assets/img/btn/${filename}.png`)
			this.$footerLogoBtn.removeClass()
			this.$footerLogoBtn.addClass(filename.toLowerCase())
		})

		$('img', this.$element).click(() => {
			this.eventBus.publish('ntv.ui.footer.click')
		})
	}

	getFile() {
		const buttonStyle = this.settingsManager.getSetting('shared.chat.emote_menu.appearance.button_style')
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
		this.$element?.remove()
	}
}
