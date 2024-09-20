import { Announcement } from '../../Services/AnnouncementService'
import { AbstractModal, ModalGeometry } from './AbstractModal'
import { cleanupHTML, parseHTML } from '../../utils'

export default class AnnouncementModal extends AbstractModal {
	eventTarget = new EventTarget()

	constructor(private announcement: Announcement) {
		const geometry: ModalGeometry = {
			// width: '400px',
			position: 'center'
		}

		super('announcement', geometry)
	}

	init() {
		super.init()
		return this
	}

	async render() {
		super.render()

		const { announcement } = this
		const { id: announcementId, title: announcementTitle } = announcement
		const modalBodyEl = this.modalBodyEl

		this.element.setAttribute('data-announcement-id', announcementId)

		const modalHeaderEl = this.modalHeaderBodyEl
		modalHeaderEl.prepend(
			parseHTML(
				cleanupHTML(`
					<svg class="ntv__modal__logo" alt="NipahTV" width="32" height="32" viewBox="0 0 16 16" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path style="opacity:1;fill:#ff3e64;fill-opacity:1;fill-rule:nonzero;stroke-width:0.0230583" d="M 0.2512317,15.995848 0.2531577,6.8477328 C 0.24943124,6.3032776 0.7989812,5.104041 1.8304975,4.5520217 2.4476507,4.2217505 2.9962666,4.1106784 4.0212875,4.0887637 5.0105274,4.067611 5.5052433,4.2710769 5.6829817,4.3608374 c 0.4879421,0.2263549 0.995257,0.7009925 1.134824,0.9054343 l 4.4137403,6.8270373 c 0.262057,0.343592 0.582941,0.565754 0.919866,0.529874 0.284783,-0.0234 0.4358,-0.268186 0.437049,-0.491242 l 0.003,-9.2749904 L 0.25,2.8575985 0.25004315,0 15.747898,2.1455645e-4 15.747791,13.08679 c -0.0055,0.149056 -0.09606,1.191174 -1.033875,2.026391 -0.839525,0.807902 -2.269442,0.879196 -2.269442,0.879196 -0.601658,0.0088 -1.057295,0.02361 -1.397155,-0.04695 -0.563514,-0.148465 -0.807905,-0.274059 -1.274522,-0.607992 -0.4091245,-0.311857 -0.6818768,-0.678904 -0.9118424,-0.98799 0,0 -1.0856521,-1.86285 -1.8718165,-3.044031 C 6.3863506,10.352753 5.3651096,8.7805786 4.8659674,8.1123589 4.4859461,7.5666062 4.2214229,7.4478431 4.0798053,7.3975803 3.9287117,7.3478681 3.7624996,7.39252 3.6345251,7.4474753 3.5213234,7.5006891 3.4249644,7.5987165 3.4078407,7.7314301 l 7.632e-4,8.2653999 z"/></svg><h2>${
						announcementTitle ? announcementTitle : 'Announcement'
					}</h2>`)
			)
		)

		modalBodyEl.appendChild(parseHTML(cleanupHTML(announcement.message)))

		const buttonContainerEl = document.createElement('div')
		buttonContainerEl.classList.add('ntv__announcement-modal__button-container')

		if (announcement.showDontShowAgainButton) {
			const buttonEl = parseHTML(`<button class="ntv__button">Don't show again</button>`, true) as HTMLElement
			buttonEl.addEventListener('click', () => this.closePermanently())
			buttonContainerEl.appendChild(buttonEl)
		}
		if (announcement.showCloseButton) {
			const buttonEl = parseHTML(`<button class="ntv__button">Close</button>`, true) as HTMLElement
			buttonEl.addEventListener('click', () => this.close())
			buttonContainerEl.appendChild(buttonEl)
		}

		modalBodyEl.appendChild(buttonContainerEl)

		// const overflowWrapperEl = document.createElement('div')
		// overflowWrapperEl.classList.add('ntv__announcement-modal__overflow-wrapper')

		// const overflowWrapperInnerEl = document.createElement('div')
		// overflowWrapperInnerEl.appendChild(parseHTML(announcement.message))

		// const buttonEl = parseHTML(`<button class="ntv__button">Close</button>`, true) as HTMLElement
		// buttonEl.addEventListener('click', () => this.close())

		// overflowWrapperEl.appendChild(overflowWrapperInnerEl)
		// modalBodyEl.appendChild(overflowWrapperEl)
		// modalBodyEl.appendChild(buttonEl)
	}

	closePermanently() {
		this.eventTarget.dispatchEvent(new Event('acknowledged_announcement'))
		this.close()
	}

	close() {
		super.destroy()
	}
}
