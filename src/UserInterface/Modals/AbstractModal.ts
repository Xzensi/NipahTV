import { cleanupHTML, log, parseHTML } from '../../utils'
import { AbstractComponent } from '../Components/AbstractComponent'

export type ModalGeometry = {
	width?: string
	position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'chat-top' | 'coordinates'
	coords?: { x: number; y: number }
}

/*
    This abstract class meant for inheritance deals with the creation of the modal container element, it's header and body.
    It also handles the logic for closing the modal by clicking the close button.
    It also handles the logic for moving the modal around by dragging the header.
*/
export class AbstractModal extends AbstractComponent {
	event = new EventTarget()
	className?: string
	geometry?: ModalGeometry

	element: HTMLElement
	modalHeaderEl: HTMLElement
	modalBodyEl: HTMLElement
	modalCloseBtn: HTMLElement

	constructor(className?: string, geometry?: ModalGeometry) {
		super()

		this.className = className
		this.geometry = geometry

		const position = this.geometry?.position
		let positionStyle = ''
		if (position === 'chat-top') {
			positionStyle = 'right:0;top:43px;'
		} else if (position === 'coordinates' && this.geometry?.coords) {
			const coords = this.geometry.coords
			positionStyle = `left:${coords.x}px;top:${coords.y}px;`
		}

		const widthStyle = this.geometry?.width ? `width:${this.geometry.width}` : ''
		const styleAttribute = `style="${widthStyle};${positionStyle}"`

		this.element = parseHTML(
			cleanupHTML(
				`<div class="ntv__modal ${this.className ? `ntv__${this.className}-modal` : ''}" ${styleAttribute}>
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
		if (this.geometry?.position === 'center') this.centerModal()
	}

	// Attaches event handlers for the modal
	attachEventHandlers() {
		this.modalCloseBtn.addEventListener('click', () => {
			this.destroy()
			this.event.dispatchEvent(new Event('close'))
		})

		this.modalHeaderEl.addEventListener('mousedown', this.handleModalDrag.bind(this))

		// On window resize adjust the modal position
		if (this.geometry?.position === 'center') {
			window.addEventListener('resize', this.centerModal.bind(this))
		}
	}

	destroy() {
		this.element.remove()
	}

	centerModal() {
		const windowHeight = window.innerHeight as number
		const windowWidth = window.innerWidth as number

		this.element.style.left = windowWidth / 2 + 'px'
		this.element.style.top = windowHeight / 2 + 'px'
		this.element.style.removeProperty('right')
		this.element.style.removeProperty('bottom')
		this.element.style.transform = 'translate(-50%, -50%)'
	}

	handleModalDrag(event: MouseEvent) {
		const modal = this.element
		const modalOffset = modal.getBoundingClientRect()
		const cursorOffsetX = event.pageX - modalOffset.left
		const cursorOffsetY = event.pageY - modalOffset.top
		const windowHeight = window.innerHeight
		const windowWidth = window.innerWidth
		const modalWidth = modal.clientWidth
		const modalHeight = modal.clientHeight

		const handleDrag = (evt: MouseEvent | any) => {
			let x = evt.pageX - cursorOffsetX
			let y = evt.pageY - cursorOffsetY

			if (x < 0) x = 0
			if (y < 0) y = 0
			if (x + modalWidth > windowWidth) x = windowWidth - modalWidth
			if (y + modalHeight > windowHeight) y = windowHeight - modalHeight

			modal.style.left = `${x}px`
			modal.style.top = `${y}px`
			this.element.style.removeProperty('transform')
		}

		const handleDragEnd = () => {
			document.removeEventListener('mousemove', handleDrag)
			document.removeEventListener('mouseup', handleDragEnd)
		}

		document.addEventListener('mousemove', handleDrag)
		document.addEventListener('mouseup', handleDragEnd)
	}
}
