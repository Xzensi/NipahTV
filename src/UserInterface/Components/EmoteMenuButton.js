import { AbstractComponent } from './AbstractComponent'

export class EmoteMenuButton extends AbstractComponent {
	constructor({ ENV_VARS, eventBus }) {
		super()

		this.ENV_VARS = ENV_VARS
		this.eventBus = eventBus
	}

	render() {
		const basePath = this.ENV_VARS.RESOURCE_ROOT
		this.$element = $(`
            <div class="nipah_client_footer">
                <img class="footer_logo_btn" srcset="${basePath}/dist/logo_1.png 1x, ${basePath}/dist/logo_1@2x.png 2x, ${basePath}/dist/logo_1@3x.png 3x" draggable="false" alt="Nipah">
            </div>
        `)
		$('#chatroom-footer .send-row').prepend(this.$element)
	}

	attachEventHandlers() {
		$('.footer_logo_btn', this.$element).click(() => {
			this.eventBus.publish('nipah.ui.footer.click')
		})
	}
}
