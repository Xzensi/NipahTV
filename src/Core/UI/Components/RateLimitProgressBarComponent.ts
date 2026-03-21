import type { RateLimiterState } from '@core/Common/RateLimiter'
import { cleanupHTML, parseHTML } from '@core/Common/utils'
import { AbstractComponent } from '@core/UI/Components/AbstractComponent'

export default class RateLimitProgressBarComponent extends AbstractComponent {
	element: HTMLElement

	private fillElement: HTMLElement | null = null
	private activeCooldownKey: string | null = null
	private hideTimeout: ReturnType<typeof setTimeout> | null = null

	constructor() {
		super()

		this.element = parseHTML(
			cleanupHTML(`
				<div class="ntv__rate-limit-progress" role="progressbar" aria-label="Chat rate limit cooldown">
					<div class="ntv__rate-limit-progress__track">
						<div class="ntv__rate-limit-progress__fill"></div>
					</div>
				</div>
			`),
			true
		) as HTMLElement
	}

	render() {
		this.fillElement = this.element.querySelector('.ntv__rate-limit-progress__fill') as HTMLElement
	}

	attachEventHandlers() {}

	update(state: RateLimiterState) {
		if (!state.isCoolingDown || !state.cooldownEndsAt || state.remainingMs <= 0) {
			this.hide()
			return
		}

		const cooldownKey = `${state.cooldownStartedAt ?? 'unknown'}:${state.cooldownEndsAt}`
		const cooldownDurationMs = Math.max(state.cooldownDurationMs, state.remainingMs, 1)
		const elapsedMs = Math.max(cooldownDurationMs - state.remainingMs, 0)

		this.element.classList.add('ntv__rate-limit-progress--active')
		this.element.setAttribute(
			'ntv-tooltip',
			state.queueSize > 0
				? `Chat rate limit active. ${state.queueSize} message${state.queueSize === 1 ? '' : 's'} queued.`
				: 'Chat rate limit active.'
		)
		this.element.setAttribute('aria-valuemin', '0')
		this.element.setAttribute('aria-valuemax', `${cooldownDurationMs}`)
		this.element.setAttribute('aria-valuenow', `${Math.max(state.remainingMs, 0)}`)

		if (this.fillElement && this.activeCooldownKey !== cooldownKey) {
			this.activeCooldownKey = cooldownKey
			this.fillElement.style.setProperty('--ntv-rate-limit-progress-duration', `${cooldownDurationMs}ms`)
			this.fillElement.style.setProperty('--ntv-rate-limit-progress-delay', `${-elapsedMs}ms`)
			this.restartAnimation()
		}

		this.scheduleHide(state.remainingMs)
	}

	destroy() {
		this.clearHideTimeout()
		this.element.remove()
	}

	private hide() {
		this.activeCooldownKey = null
		this.clearHideTimeout()
		this.element.classList.remove('ntv__rate-limit-progress--active')
		this.element.removeAttribute('ntv-tooltip')
		this.element.removeAttribute('aria-valuemin')
		this.element.removeAttribute('aria-valuemax')
		this.element.removeAttribute('aria-valuenow')

		if (this.fillElement) {
			this.fillElement.classList.remove('ntv__rate-limit-progress__fill--animating')
			this.fillElement.style.removeProperty('--ntv-rate-limit-progress-duration')
			this.fillElement.style.removeProperty('--ntv-rate-limit-progress-delay')
		}
	}

	private restartAnimation() {
		if (!this.fillElement) return

		this.fillElement.classList.remove('ntv__rate-limit-progress__fill--animating')
		void this.fillElement.offsetWidth
		this.fillElement.classList.add('ntv__rate-limit-progress__fill--animating')
	}

	private scheduleHide(remainingMs: number) {
		this.clearHideTimeout()

		this.hideTimeout = setTimeout(
			() => {
				this.hide()
			},
			Math.max(remainingMs, 0) + 50
		)
	}

	private clearHideTimeout() {
		if (!this.hideTimeout) return

		clearTimeout(this.hideTimeout)
		this.hideTimeout = null
	}
}
