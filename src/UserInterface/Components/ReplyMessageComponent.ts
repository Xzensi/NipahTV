import { cleanupHTML, log, parseHTML } from '../../utils'
import { AbstractComponent } from './AbstractComponent'

export default class ReplyMessageComponent extends AbstractComponent {
	private element: HTMLElement
	private containerEl: HTMLElement

	eventTarget = new EventTarget()

	constructor(containerEl: HTMLElement, messageNodes: Node[]) {
		super()

		this.containerEl = containerEl

		this.element = parseHTML(
			cleanupHTML(`
			<div class="ntv__reply-message">
				<div class="ntv__reply-message__header">
					<svg x<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32">
						<path fill="currentColor" d="m12.281 5.281l-8 8l-.687.719l.687.719l8 8l1.438-1.438L7.438 15H21c2.773 0 5 2.227 5 5s-2.227 5-5 5v2c3.855 0 7-3.145 7-7s-3.145-7-7-7H7.437l6.282-6.281z" />
					</svg>
					<span>Replying to:</span>
					<svg class="ntv__reply-message__close-btn ntv__icon-button" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 50 50">
						<path fill="currentColor" d="m37.304 11.282l1.414 1.414l-26.022 26.02l-1.414-1.413z" />
						<path fill="currentColor" d="m12.696 11.282l26.022 26.02l-1.414 1.415l-26.022-26.02z" />
					</svg>
				</div>
				<div class="ntv__reply-message__content">
				</div>
			</div>
		`),
			true
		) as HTMLElement

		const contentEl = this.element.querySelector('.ntv__reply-message__content')!

		for (const messageNode of messageNodes) {
			contentEl.append(messageNode.cloneNode(true))
		}
	}

	render() {
		this.containerEl.append(this.element)
	}

	// Method to attach event handlers
	attachEventHandlers() {
		const closeBtn = this.element.querySelector('.ntv__reply-message__close-btn')!
		closeBtn.addEventListener('click', () => {
			this.element.remove()
			this.eventTarget.dispatchEvent(new Event('close'))
		})
	}

	addEventListener(event: string, callback: EventListener) {
		this.eventTarget.addEventListener(event, callback)
	}

	destroy() {
		log('Destroying reply message component..', this.element)
		this.element.remove()
	}
}
