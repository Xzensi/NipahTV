import { AbstractComponent } from './AbstractComponent'

export class CheckboxComponent extends AbstractComponent {
	event = new EventTarget()

	constructor(id, label, checked = false) {
		super()

		this.id = id
		this.label = label
		this.checked = checked
	}

	render() {
		this.$element = $(`
            <div class="nipah__checkbox">
                <input type="checkbox" id="${this.id}" ${this.checked ? 'checked' : ''}>
                <label for="${this.id}">${this.label}</label>
            </div>
        `)
	}

	attachEventHandlers() {
		this.$element.find('input').on('change', e => {
			this.checked = e.target.checked
			this.event.dispatchEvent(new Event('change'))
		})
	}

	getValue() {
		return this.checked
	}
}
