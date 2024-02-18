import { AbstractComponent } from './AbstractComponent'

export class DropdownComponent extends AbstractComponent {
	event = new EventTarget()

	constructor(id, label, options = []) {
		super()
		this.id = id
		this.label = label
		this.options = options
	}

	render() {
		this.$element = $(`
            <div class="nipah__dropdown">
                <label for="${this.id}">${this.label}</label>
                <select id="${this.id}">
                    ${this.options.map(option => `<option value="${option.value}">${option.label}</option>`).join('')}
                </select>
            </div>
        `)
	}

	attachEventHandlers() {
		this.$element.find('select').on('change', e => {
			this.event.dispatchEvent(new Event('change'))
		})
	}

	getValue() {
		return this.$element.find('select').val()
	}
}
