import { AbstractComponent } from './AbstractComponent'

export class CheckboxComponent extends AbstractComponent {
	event = new EventTarget()
	$element?: JQuery<HTMLElement>
	checked: boolean
	label: string
	id: string

	constructor(id: string, label: string, checked = false) {
		super()

		this.id = id
		this.label = label
		this.checked = checked
	}

	render() {
		this.$element = $(`
            <div class="ntv__checkbox">
                <input type="checkbox" id="${this.id}" ${this.checked ? 'checked' : ''}>
                <label for="${this.id}">${this.label}</label>
            </div>
        `)
	}

	attachEventHandlers() {
		this.$element?.find('input').on('change', e => {
			this.checked = e.target.checked
			this.event.dispatchEvent(new Event('change'))
		})
	}

	getValue() {
		return this.checked
	}
}
