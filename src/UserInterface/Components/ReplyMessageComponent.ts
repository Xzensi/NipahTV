import { cleanupHTML, log, parseHTML } from '../../utils'
import { AbstractComponent } from './AbstractComponent'

export class ReplyMessageComponent extends AbstractComponent {
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
					<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
						<path fill="currentColor" d="M9 16h7.2l-2.6 2.6L15 20l5-5l-5-5l-1.4 1.4l2.6 2.6H9c-2.2 0-4-1.8-4-4s1.8-4 4-4h2V4H9c-3.3 0-6 2.7-6 6s2.7 6 6 6" />
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
