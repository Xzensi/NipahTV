import { cleanupHTML, log, parseHTML } from '../../Common/utils'
import { AbstractComponent } from './AbstractComponent'

export class SteppedInputSliderComponent<K = string | number> extends AbstractComponent {
	private value: K
	private labels: string[]
	private steps: any[]

	event = new EventTarget()
	element: HTMLElement

	constructor(labels: string[], steps: K[], value?: K) {
		super()

		this.labels = labels
		this.steps = steps

		const defaultIndex = (typeof value !== 'undefined' && steps.indexOf(value)) || 0

		this.element = parseHTML(
			cleanupHTML(`
            <div class="ntv__stepped-input-slider">
                <input type="range" min="0" max="${this.steps.length - 1}" step="1" value="${defaultIndex}">
                <div>${this.labels[defaultIndex]}</div>
            </div>
        `),
			true
		) as HTMLElement

		this.value = value || steps[0]
	}

	render() {}

	attachEventHandlers() {
		if (!this.element) return

		const input = this.element.querySelector('input') as HTMLInputElement
		const label = this.element.querySelector('div') as HTMLElement

		input.addEventListener('input', () => {
			label.textContent = this.labels[parseInt(input.value)]
			this.value = this.steps[parseInt(input.value)] || this.steps[0]
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
