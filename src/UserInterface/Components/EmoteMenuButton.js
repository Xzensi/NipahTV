import { cleanupHTML } from '../../utils'
import { AbstractComponent } from './AbstractComponent'

export class EmoteMenuButton extends AbstractComponent {
	constructor({ ENV_VARS, eventBus }) {
		super()

		this.ENV_VARS = ENV_VARS
		this.eventBus = eventBus
	}

	render() {
		const basePath = this.ENV_VARS.RESOURCE_ROOT + '/dist/img'
		this.$element = $(
			cleanupHTML(`
				<div class="nipah_client_footer">
					<img class="footer_logo_btn" srcset="${basePath}/logo.png 1x, ${basePath}/logo@2x.png 2x, ${basePath}/logo@3x.png 3x" draggable="false" alt="Nipah">
				</div>
			`)
		)
		$('#chatroom-footer .send-row').prepend(this.$element)
	}

	attachEventHandlers() {
		$('.footer_logo_btn', this.$element).click(() => {
			this.eventBus.publish('nipah.ui.footer.click')
		})
	}

	destroy() {
		this.$element.remove()
	}
}
