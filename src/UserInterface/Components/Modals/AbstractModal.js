import { AbstractComponent } from '../AbstractComponent'
import { log } from '../../../utils'

/*
    This abstract class meant for inheritance deals with the creation of the modal container element, it's header and body.
    It also handles the logic for closing the modal by clicking the close button.
    It also handles the logic for moving the modal around by dragging the header.
*/
export class AbstractModal extends AbstractComponent {
	event = new EventTarget()

	constructor(className) {
		super()
		this.className = className
	}

	init() {
		// Calls render() and attachEventHandlers() from AbstractComponent
		super.init()
	}

	// Renders the modal container, header and body
	render() {
		this.$modal = $(`
            <div class="nipah__modal ${this.className ? `nipah__${this.className}-modal` : ''}">
                <div class="nipah__modal__header">
                    <h3 class="nipah__modal__title"></h3>
                    <button class="nipah__modal__close-btn">🞨</button>
                </div>
                <div class="nipah__modal__body"></div>
            </div>
        `)

		this.$modalHeader = this.$modal.find('.nipah__modal__header')
		this.$modalBody = this.$modal.find('.nipah__modal__body')
		this.$modalClose = this.$modalHeader.find('.nipah__modal__close-btn')

		$('body').append(this.$modal)

		// Center the modal to center of screen
		this.centerModal()
	}

	// Attaches event handlers for the modal
	attachEventHandlers() {
		this.$modalClose.on('click', () => {
			this.destroy()
			this.event.dispatchEvent(new Event('close'))
		})
		this.$modalHeader.on('mousedown', this.handleModalDrag.bind(this))

		// On window resize adjust the modal position
		$(window).on('resize', this.centerModal.bind(this))
	}

	destroy() {
		this.$modal.remove()
	}

	centerModal() {
		const windowHeight = $(window).height()
		const windowWidth = $(window).width()

		this.$modal.css({
			left: windowWidth / 2,
			top: windowHeight / 2
		})
	}

	handleModalDrag(evt) {
		const $modal = this.$modal
		const modalOffset = $modal.offset()
		const offsetX = evt.pageX - modalOffset.left
		const offsetY = evt.pageY - modalOffset.top
		const windowHeight = $(window).height()
		const windowWidth = $(window).width()
		const modalWidth = $modal.width()
		const modalHeight = $modal.height()

		const handleDrag = evt => {
			let x = evt.pageX - offsetX
			let y = evt.pageY - offsetY

			if (x < 0) x = 0
			if (y < 0) y = 0
			if (x + modalWidth > windowWidth) x = windowWidth - modalWidth
			if (y + modalHeight > windowHeight) y = windowHeight - modalHeight

			$modal.offset({
				left: x,
				top: y
			})
		}

		const handleDragEnd = () => {
			$(document).off('mousemove', handleDrag)
			$(document).off('mouseup', handleDragEnd)
		}

		$(document).on('mousemove', handleDrag)
		$(document).on('mouseup', handleDragEnd)
	}
}
