import { AbstractComponent } from './AbstractComponent'

export class DropdownComponent extends AbstractComponent {
	event = new EventTarget()
	id: string
	label: string
	options: { label: string; value: string }[]
	selectedOption: string | null
	$element?: JQuery<HTMLElement>

	constructor(id: string, label: string, options = [], selectedOption = null) {
		super()
		this.id = id
		this.label = label
		this.options = options
		this.selectedOption = selectedOption
	}

	render() {
		this.$element = $(`
            <div class="ntv__dropdown">
                <label for="${this.id}">${this.label}</label>
                <select id="${this.id}">
                    ${this.options
						.map(option => {
							const selected =
								this.selectedOption && option.value === this.selectedOption ? 'selected' : ''
							return `<option value="${option.value}" ${selected}>${option.label}</option>`
						})
						.join('')}
                </select>
            </div>
        `)
	}

	attachEventHandlers() {
		this.$element?.find('select').on('change', e => {
			this.event.dispatchEvent(new Event('change'))
		})
	}

	getValue() {
		return this.$element?.find('select').val()
	}
}
