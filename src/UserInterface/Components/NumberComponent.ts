import { AbstractComponent } from './AbstractComponent'

export class NumberComponent extends AbstractComponent {
	event = new EventTarget()
	$element?: JQuery<HTMLElement>
	id: string
	label: string
	value: number
	min: number
	max: number
	step: number

	constructor(id: string, label: string, value = 0, min = 0, max = 10, step = 1) {
		super()

		this.id = id
		this.label = label
		this.value = value
		this.min = min
		this.max = max
		this.step = step
	}

	render() {
		this.$element = $(`
            <div class="nipah__number">
				<label for="${this.id}">${this.label}</label>
                <input type="number" id="${this.id}" name="${this.id}" value="${this.value}" min="${this.min}" max="${this.max}" step="${this.step}">
            </div>
        `)
	}

	attachEventHandlers() {
		this.$element?.find('input').on('input', e => {
			this.value = +e.target.value
			this.event.dispatchEvent(new Event('change'))
		})
	}

	getValue() {
		return this.value
	}
}
