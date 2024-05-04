import { cleanupHTML, log, parseHTML } from '../../utils'
import { AbstractComponent } from '../Components/AbstractComponent'

/*
    This abstract class meant for inheritance deals with the creation of the modal container element, it's header and body.
    It also handles the logic for closing the modal by clicking the close button.
    It also handles the logic for moving the modal around by dragging the header.
*/
export class AbstractModal extends AbstractComponent {
	event = new EventTarget()
	className?: string

	element: HTMLElement
	modalHeaderEl: HTMLElement
	modalBodyEl: HTMLElement
	modalCloseBtn: HTMLElement

	constructor(className?: string) {
		super()

		this.className = className

		this.element = parseHTML(
			cleanupHTML(
				`<div class="ntv__modal ${this.className ? `ntv__${this.className}-modal` : ''}">
								<div class="ntv__modal__header">
									<h3 class="ntv__modal__title"></h3>
									<button class="ntv__modal__close-btn">🞨</button>
								</div>
								<div class="ntv__modal__body"></div>
							</div>`
			),
			true
		) as HTMLElement

		this.modalHeaderEl = this.element.querySelector('.ntv__modal__header') as HTMLElement
		this.modalBodyEl = this.element.querySelector('.ntv__modal__body') as HTMLElement
		this.modalCloseBtn = this.element.querySelector('.ntv__modal__close-btn') as HTMLElement
	}

	init() {
		// Calls render() and attachEventHandlers() from AbstractComponent
		super.init()
		return this
	}

	// Renders the modal container, header and body
	render() {
		document.body.appendChild(this.element)

		// Center the modal to center of screen
		this.centerModal()
	}

	// Attaches event handlers for the modal
	attachEventHandlers() {
		this.modalCloseBtn.addEventListener('click', () => {
			this.destroy()
			this.event.dispatchEvent(new Event('close'))
		})

		// this.modalHeaderEl.addEventListener('mousedown', this.handleModalDrag.bind(this))

		// On window resize adjust the modal position
		window.addEventListener('resize', this.centerModal.bind(this))
	}

	destroy() {
		this.element.remove()
	}

	centerModal() {
		const windowHeight = window.innerHeight as number
		const windowWidth = window.innerWidth as number

		this.element.style.left = `${windowWidth / 2}px`
		this.element.style.top = `${windowHeight / 2}px`
	}

	handleModalDrag(event: MouseEvent) {
		const modal = this.element
		const offsetParent = modal.offsetParent
		const modalOffset = offsetParent ? offsetParent.getBoundingClientRect() : modal.getBoundingClientRect()
		const offsetX = event.pageX - modalOffset.left
		const offsetY = event.pageY - modalOffset.top
		const windowHeight = window.innerHeight
		const windowWidth = window.innerWidth
		const modalWidth = modal.clientWidth
		const modalHeight = modal.clientHeight

		// const $modal = this.$modal as JQuery<HTMLElement>
		// const modalOffset = $modal.offset() as JQuery.Coordinates
		// const offsetX = event.pageX - modalOffset.left
		// const offsetY = event.pageY - modalOffset.top
		// const windowHeight = $(window).height() as number
		// const windowWidth = $(window).width() as number
		// const modalWidth = $modal.width() as number
		// const modalHeight = $modal.height() as number

		const handleDrag = (evt: MouseEvent | any) => {
			let x = evt.pageX - offsetX
			let y = evt.pageY - offsetY

			if (x < 0) x = 0
			if (y < 0) y = 0
			if (x + modalWidth > windowWidth) x = windowWidth - modalWidth
			if (y + modalHeight > windowHeight) y = windowHeight - modalHeight

			// $modal.offset({
			// 	left: x,
			// 	top: y
			// })

			modal.style.left = `${x}px`
			modal.style.top = `${y}px`
		}

		const handleDragEnd = () => {
			document.removeEventListener('mousemove', handleDrag)
			document.removeEventListener('mouseup', handleDragEnd)
		}

		document.addEventListener('mousemove', handleDrag)
		document.addEventListener('mouseup', handleDragEnd)
	}
}
