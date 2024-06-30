import { cleanupHTML, parseHTML } from '../../utils'
import { AbstractComponent } from './AbstractComponent'

export class TimerComponent extends AbstractComponent {
	private remainingTime: number
	private paused = false
	private interval?: NodeJS.Timeout

	event = new EventTarget()
	element: HTMLElement

	constructor(duration: string, description?: string) {
		super()

		// Duration can be in format of 30s, 30m or 30h where s is seconds, m is minutes and h is hours
		// Calculate the remaining time in seconds based on the duration
		this.remainingTime = parseInt(duration) * (duration.includes('s') ? 1 : duration.includes('m') ? 60 : 3600)

		this.element = parseHTML(
			cleanupHTML(`
                <div class="ntv__timer">
                    <div class="ntv__timer__body">
                        <div class="ntv__timer__duration">${this.formatTime(this.remainingTime)}</div>
                        <div class="ntv__timer__description">${description || ''}</div>
                    </div>
                    <div class="ntv__timer__buttons">
                        <button class="ntv__timer__pause ntv__icon-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20">
                                <path fill="currentColor" d="M5 4h3v12H5zm7 0h3v12h-3z" />
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16">
                                <path fill="currentColor" d="M10.804 8L5 4.633v6.734zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696z" />
                            </svg>
                        </button>
                        <button class="ntv__timer__remove ntv__icon-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 50 50">
                                <path fill="currentColor" d="m37.304 11.282l1.414 1.414l-26.022 26.02l-1.414-1.413z" />
                                <path fill="currentColor" d="m12.696 11.282l26.022 26.02l-1.414 1.415l-26.022-26.02z" />
                            </svg>
                        </button>
                    </div>
                </div>
        `),
			true
		) as HTMLElement
	}

	render() {}

	attachEventHandlers() {
		const pauseButton = this.element.querySelector('.ntv__timer__pause') as HTMLElement
		const removeButton = this.element.querySelector('.ntv__timer__remove') as HTMLElement

		pauseButton.addEventListener('click', () => {
			if (this.paused) {
				this.paused = false
				pauseButton.classList.remove('ntv__timer__pause--paused')
				this.startTimer()
				this.event.dispatchEvent(new CustomEvent('unpaused'))
			} else {
				this.paused = true
				pauseButton.classList.add('ntv__timer__pause--paused')

				if (this.interval) {
					clearInterval(this.interval)
					delete this.interval
				}

				this.event.dispatchEvent(new CustomEvent('paused'))
			}
		})

		removeButton.addEventListener('click', () => {
			this.event.dispatchEvent(new CustomEvent('destroy'))
			this.element.remove()
		})

		this.startTimer()
	}

	private startTimer() {
		const durationEl = this.element.querySelector('.ntv__timer__duration')

		this.interval = setInterval(() => {
			this.remainingTime--
			durationEl!.textContent = this.formatTime(this.remainingTime)

			if (this.remainingTime <= 0) {
				durationEl?.classList.add('ntv__timer__duration--expired')
			}
		}, 1000)
	}

	private formatTime(time: number) {
		const sign = time < 0 ? '-' : ''
		time = Math.abs(time)

		const hours = Math.floor(time / 3600)
		const minutes = Math.floor((time % 3600) / 60)
		const seconds = time % 60

		return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
			.toString()
			.padStart(2, '0')}`
	}
}
