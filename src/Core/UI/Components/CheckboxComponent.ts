import { parseHTML, cleanupHTML } from '@core/Common/utils'
import { AbstractComponent } from './AbstractComponent'

export class CheckboxComponent extends AbstractComponent {
	private checked: boolean
	private label: string
	private id: string

	event = new EventTarget()
	element: HTMLElement

	constructor(id: string, label: string, checked = false) {
		super()

		this.id = id
		this.label = label
		this.checked = checked

		this.element = parseHTML(
			cleanupHTML(`
            <div class="ntv__checkbox">
                <input type="checkbox" id="${this.id}" ${this.checked ? 'checked' : ''}>
                <label for="${this.id}">${this.label}</label>
            </div>
        `),
			true
		) as HTMLElement
	}

	render() {}

	attachEventHandlers() {
		const inputEl = this.element?.querySelector('input') as HTMLInputElement
		inputEl.addEventListener('change', event => {
			this.checked = (event.target as HTMLInputElement).checked
			this.event.dispatchEvent(new Event('change'))
		})
	}

	addEventListener(event: string, callback: EventListener) {
		this.event.addEventListener(event, callback)
	}

	getValue() {
		return this.checked
	}
}
