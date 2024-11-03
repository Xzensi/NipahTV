import { SteppedInputSliderComponent } from '../Components/SteppedInputSliderComponent'
import { AbstractModal, ModalGeometry } from './AbstractModal'
import { cleanupHTML, parseHTML } from '@core/Common/utils'
import { Toaster } from '@core/Common/Toaster'

export default class PollModal extends AbstractModal {
	private rootContext: RootContext
	private session: Session
	private toaster: Toaster

	private pollQuestionEl?: HTMLTextAreaElement
	private pollOptionsEls?: NodeListOf<HTMLInputElement>
	private durationSliderComponent!: SteppedInputSliderComponent<number>
	private displayDurationSliderComponent!: SteppedInputSliderComponent<number>
	private createButtonEl?: HTMLButtonElement
	private cancelButtonEl?: HTMLButtonElement

	constructor(
		rootContext: RootContext,
		session: Session,
		{
			toaster
		}: {
			toaster: Toaster
		}
	) {
		const geometry: ModalGeometry = {
			width: '340px',
			position: 'center'
		}

		super('poll', geometry)

		this.rootContext = rootContext
		this.session = session
		this.toaster = toaster
	}

	init() {
		super.init()
		return this
	}

	async render() {
		super.render()

		const element = parseHTML(
			cleanupHTML(`
            <h3 class="ntv__poll-modal__title">Create a new Poll</h3>
            <span class="ntv__poll-modal__subtitle">Question:</span>
            <textarea rows="1" class="ntv__input ntv__poll-modal__q-input" placeholder="Poll question" capture-focus></textarea>
            <span class="ntv__poll-modal__subtitle">Options (minimum 2):</span>
            <input type="text" class="ntv__input ntv__poll-modal__o-input" placeholder="Option 1" capture-focus>
            <input type="text" class="ntv__input ntv__poll-modal__o-input" placeholder="Option 2" capture-focus>
            <input type="text" class="ntv__input ntv__poll-modal__o-input" placeholder="Option 3" capture-focus disabled>
            <input type="text" class="ntv__input ntv__poll-modal__o-input" placeholder="Option 4" capture-focus disabled>
            <input type="text" class="ntv__input ntv__poll-modal__o-input" placeholder="Option 5" capture-focus disabled>
            <input type="text" class="ntv__input ntv__poll-modal__o-input" placeholder="Option 6" capture-focus disabled>
            <span class="ntv__poll-modal__subtitle">Duration</span>
            <div class="ntv__poll-modal__duration"></div>
            <span class="ntv__poll-modal__subtitle">Result displayed for</span>
            <div class="ntv__poll-modal__display-duration"></div>
            <div class="ntv__poll-modal__footer">
                <button class="ntv__button ntv__button--regular ntv__poll-modal__close-btn">Cancel</button>
                <button class="ntv__button ntv__poll-modal__create-btn">Create</button>
            </div>`)
		)

		this.pollQuestionEl = element.querySelector('.ntv__poll-modal__q-input') as HTMLTextAreaElement
		this.pollOptionsEls = element.querySelectorAll('.ntv__poll-modal__o-input')

		const durationWrapper = element.querySelector('.ntv__poll-modal__duration') as HTMLDivElement
		this.durationSliderComponent = new SteppedInputSliderComponent(
			['30 seconds', '1 minute', '2 minutes', '3 minutes', '4 minutes', '5 minutes'],
			[30, 60, 120, 180, 240, 300]
		).init()

		durationWrapper.appendChild(this.durationSliderComponent.element)

		const displayDurationWrapper = element.querySelector('.ntv__poll-modal__display-duration') as HTMLDivElement
		this.displayDurationSliderComponent = new SteppedInputSliderComponent(
			['30 seconds', '1 minute', '2 minutes', '3 minutes', '4 minutes', '5 minutes'],
			[30, 60, 120, 180, 240, 300]
		).init()

		displayDurationWrapper.appendChild(this.displayDurationSliderComponent.element)

		this.createButtonEl = element.querySelector('.ntv__poll-modal__create-btn') as HTMLButtonElement
		this.cancelButtonEl = element.querySelector('.ntv__poll-modal__close-btn') as HTMLButtonElement

		this.modalBodyEl.appendChild(element)
	}

	attachEventHandlers() {
		super.attachEventHandlers()

		for (let i = 1; i < this.pollOptionsEls!.length; i++) {
			this.pollOptionsEls![i].addEventListener('input', () => {
				const currentOptionEl = this.pollOptionsEls![i]
				const nextOptionEl = this.pollOptionsEls![i + 1] as HTMLInputElement

				// Enable next option input if current option is not empty
				// Disable next option input if current option is empty
				if (nextOptionEl) {
					nextOptionEl.disabled = !currentOptionEl.value.trim()
				}
			})
		}

		this.createButtonEl!.addEventListener('click', async () => {
			const question = this.pollQuestionEl!.value.trim()
			const options = Array.from(this.pollOptionsEls!)
				.map(el => el.value.trim())
				.filter(option => !!option)
			const duration = this.durationSliderComponent.getValue()
			const displayDuration = this.displayDurationSliderComponent.getValue()

			if (!question) {
				this.toaster.addToast('Please enter a question', 6_000, 'error')
				return
			}

			if (options.length < 2) {
				this.toaster.addToast('Please enter at least 2 options', 6_000, 'error')
				return
			}

			if (options.some(option => !option)) {
				this.toaster.addToast('Please fill in all options', 6_000, 'error')
				return
			}

			const channelName = this.session.channelData.channelName

			this.session.networkInterface.createPoll(channelName, question, options, duration, displayDuration)
			this.destroy()
		})

		this.cancelButtonEl!.addEventListener('click', async () => {
			this.destroy()
		})
	}
}
