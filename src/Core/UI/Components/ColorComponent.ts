import { cleanupHTML, log, parseHTML } from '../../Common/utils'
import { AbstractComponent } from './AbstractComponent'

export class ColorComponent extends AbstractComponent {
	private value: string
	private label: string
	private id: string

	event = new EventTarget()
	element: HTMLElement

	constructor(id: string, label: string, value = '#000000') {
		super()
		this.id = id
		this.label = label
		this.value = value

		this.element = parseHTML(
			cleanupHTML(`
            <div class="ntv__color">
                <label for="${this.id}">${this.label}</label>
                <input type="color" id="${this.id}" value="${this.value}">
            </div>
        `),
			true
		) as HTMLElement
	}

	render() {}

	attachEventHandlers() {
		const inputEl = this.element.querySelector('input') as HTMLInputElement
		inputEl.addEventListener('change', event => {
			this.value = (event.target as HTMLInputElement).value
			this.event.dispatchEvent(new Event('change'))
		})
	}

	getValue() {
		return this.value
	}
}
