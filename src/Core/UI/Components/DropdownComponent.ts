import { cleanupHTML, parseHTML } from '@core/Common/utils'
import { AbstractComponent } from './AbstractComponent'

export class DropdownComponent extends AbstractComponent {
	private id: string
	private label: string
	private options: { label: string; value: string }[]
	private selectedOption: string | null
	private selectEl: HTMLSelectElement

	event = new EventTarget()
	element: HTMLElement

	constructor(id: string, label: string, options: { label: string; value: string }[], selectedOption = null) {
		super()
		this.id = id
		this.label = label
		this.options = options
		this.selectedOption = selectedOption

		this.element = parseHTML(
			cleanupHTML(`
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
        `),
			true
		) as HTMLElement

		this.selectEl = this.element?.querySelector('select') as HTMLSelectElement
	}

	render() {}

	attachEventHandlers() {
		this.selectEl.addEventListener('change', event => {
			this.event.dispatchEvent(new Event('change'))
		})
	}

	addEventListener(event: string, callback: EventListener) {
		this.event.addEventListener(event, callback)
	}

	getValue() {
		return this.selectEl.value
	}
}
