import { AbstractComponent } from './AbstractComponent'
import { cleanupHTML, parseHTML } from '../../utils'

export class SteppedInputSliderComponent extends AbstractComponent {
	container: HTMLElement
	labels: string[]
	steps: any[]
	eventTarget = new EventTarget()

	element?: HTMLElement

	constructor(container: HTMLElement, labels: string[], steps: any[]) {
		super()

		this.container = container
		this.labels = labels
		this.steps = steps
	}

	render() {
		this.element = parseHTML(
			cleanupHTML(`
            <div class="ntv__stepped-input-slider">
                <input type="range" min="0" max="${this.steps.length - 1}" step="1" value="0">
                <div>${this.labels[0]}</div>
            </div>
        `),
			true
		) as HTMLElement

		this.container.appendChild(this.element)
	}

	attachEventHandlers() {
		if (!this.element) return

		const input = this.element.querySelector('input') as HTMLInputElement
		const label = this.element.querySelector('div') as HTMLElement

		input.addEventListener('input', () => {
			label.textContent = this.labels[parseInt(input.value)]
			this.eventTarget.dispatchEvent(new Event('change'))
		})
	}

	addEventListener(event: string, callback: EventListener) {
		this.eventTarget.addEventListener(event, callback)
	}

	getValue() {
		if (!this.element) return
		const input = this.element.querySelector('input') as HTMLInputElement
		return this.steps[parseInt(input.value)] || this.steps[0]
	}
}
