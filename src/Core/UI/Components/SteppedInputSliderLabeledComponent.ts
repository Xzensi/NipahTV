import { cleanupHTML, log, parseHTML } from '../../Common/utils'
import { AbstractComponent } from './AbstractComponent'

export class SteppedInputSliderLabeledComponent<K = string | number> extends AbstractComponent {
	private value: K
	private labels: string[]
	private steps: any[]

	event = new EventTarget()
	element: HTMLElement

	constructor(labels: string[], steps: K[], label: string, value?: K) {
		super()

		this.labels = labels
		this.steps = steps

		const defaultIndex = (typeof value !== 'undefined' && steps.indexOf(value)) || 0

		// TODO make the labels cursor clickable

		this.element = parseHTML(
			cleanupHTML(`
            <div class="ntv__stepped-input-slider ntv__stepped-input-slider-labeled">
				<label>${label}</label>
				<div class="ntv__stepped-input-slider-labeled__slider">
					<input type="range" min="0" max="${this.steps.length - 1}" step="1" value="${defaultIndex}">
					<div class="ntv__stepped-input-slider-labeled__labels">
						${labels.map((label, index) => `<span>${label}</span>`).join('')}
					</div>
				</div>
            </div>
        `),
			true
		) as HTMLElement

		this.value = value || steps[0]
	}

	render() {}

	attachEventHandlers() {
		if (!this.element) return

		const inputEl = this.element.querySelector('input') as HTMLInputElement
		const labelsEl = this.element.querySelector('.ntv__stepped-input-slider-labeled__labels') as HTMLInputElement

		// Set active property of default index
		const index = parseInt(inputEl.value)
		labelsEl.children[index].setAttribute('data-active', 'true')

		inputEl.addEventListener('input', () => {
			const index = parseInt(inputEl.value)

			labelsEl.querySelectorAll('span[data-active]').forEach(el => el.removeAttribute('data-active'))
			labelsEl.children[index].setAttribute('data-active', 'true')

			this.value = this.steps[index] || this.steps[0]
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
