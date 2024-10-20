import { cleanupHTML, parseHTML } from '../../Common/utils'
import { AbstractComponent } from './AbstractComponent'

export class NumberComponent extends AbstractComponent {
	private id: string
	private label: string
	private value: number
	private min: number
	private max: number
	private step: number

	event = new EventTarget()
	element: HTMLElement

	constructor(id: string, label: string, value = 0, min = 0, max = 10, step = 1) {
		super()

		this.id = id
		this.label = label
		this.value = value
		this.min = min
		this.max = max
		this.step = step

		this.element = parseHTML(
			cleanupHTML(`
            <div class="ntv__number">
				<label for="${this.id}">${this.label}</label>
                <input type="number" id="${this.id}" name="${this.id}" value="${this.value}" min="${this.min}" max="${this.max}" step="${this.step}">
            </div>
        `),
			true
		) as HTMLElement
	}

	render() {}

	attachEventHandlers() {
		const inputEl = this.element.querySelector('input') as HTMLInputElement
		inputEl.addEventListener('input', event => {
			this.value = +(event.target as HTMLInputElement).value
			this.event.dispatchEvent(new Event('change'))
		})
	}

	addEventListener(event: string, callback: EventListener) {
		this.event.addEventListener(event, callback)
	}

	getValue() {
		return this.value
	}
}
