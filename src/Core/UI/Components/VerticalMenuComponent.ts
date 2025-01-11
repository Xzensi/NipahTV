import { AbstractComponent } from './AbstractComponent'
import { Logger } from '@core/Common/Logger'

const logger = new Logger()
const { log, info, error } = logger.destruct()

export class VerticalMenuComponent extends AbstractComponent {
	event = new EventTarget()
	element: HTMLElement

	constructor(private anchorElement: HTMLElement, private options: { label: string; value: string }[]) {
		super()

		this.element = document.createElement('div')
		this.element.classList.add('ntv__vertical-menu')

		// Render as vertical list of buttons with labels
		for (const option of options) {
			const button = document.createElement('button')
			button.textContent = option.label
			button.dataset.value = option.value
			this.element.appendChild(button)
		}
	}

	render() {
		const boundRect = this.anchorElement.getBoundingClientRect()
		this.element.style.left = boundRect.right + 'px'
		this.element.style.top = boundRect.top + 'px'

		document.body.appendChild(this.element)
	}

	attachEventHandlers() {
		const closeMenu = (event: MouseEvent) => {
			if (event.target === this.element || this.element.contains(event.target as Node)) return

			this.element.remove()
			document.removeEventListener('click', closeMenu)
			this.event.dispatchEvent(new Event('close'))
		}

		const buttonEls = this.element.querySelectorAll('button')
		buttonEls.forEach(buttonEl => {
			buttonEl.addEventListener('click', event => {
				this.element.remove()
				document.removeEventListener('click', closeMenu)

				this.event.dispatchEvent(new CustomEvent('action', { detail: buttonEl.dataset.value }))
				this.event.dispatchEvent(new Event('close'))
			})
		})

		setTimeout(() => {
			document.addEventListener('click', closeMenu)
		}, 0)
	}

	addEventListener(event: string, callback: EventListener) {
		this.event.addEventListener(event, callback)
	}
}
