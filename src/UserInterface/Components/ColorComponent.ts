import { AbstractComponent } from './AbstractComponent'

export class ColorComponent extends AbstractComponent {
	event = new EventTarget()
	$element?: JQuery<HTMLElement>
	value: string
	label: string
	id: string

	constructor(id: string, label: string, value = '#000000') {
		super()
		this.id = id
		this.label = label
		this.value = value
	}

	render() {
		this.$element = $(`
            <div class="nipah__color">
                <label for="${this.id}">${this.label}</label>
                <input type="color" id="${this.id}" value="${this.value}">
            </div>
        `)
	}

	attachEventHandlers() {
		this.$element?.find('input').on('change', e => {
			this.value = e.target.value
			this.event.dispatchEvent(new Event('change'))
		})
	}

	getValue() {
		return this.value
	}
}
