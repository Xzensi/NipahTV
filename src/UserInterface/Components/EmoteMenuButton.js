import { AbstractComponent } from './AbstractComponent'

export class EmoteMenuButton extends AbstractComponent {
	constructor({ ENV_VARS, eventBus }) {
		super()

		this.ENV_VARS = ENV_VARS
		this.eventBus = eventBus
	}

	render() {
		const basePath = this.ENV_VARS.RESOURCES_ROOT
		log(basePath)
		this.$element = $(`
            <div class="nipah_client_footer">
                <img class="footer_logo_btn" srcset="${basePath}/logo_1.png 1x, ${basePath}/logo_2.png 2x, ${basePath}/logo_3.png 2x" draggable="false" alt="Nipah">
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
