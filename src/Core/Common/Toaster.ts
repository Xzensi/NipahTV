import { parseHTML } from './utils'

type Toast = {
	message: string
	type: 'success' | 'error' | 'warning' | 'info'
	timeout: number
	element: HTMLElement
}

export class Toaster {
	private toasts: Toast[] = []

	addToast(message: string, duration: number, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
		const toastEl = parseHTML(
			`<div class="ntv__toast ntv__toast--${type} ntv__toast--top-right" aria-live="polite">${message}</div>`,
			true
		) as HTMLElement

		const timeout = Date.now() + duration
		const toast = { message, type, timeout, element: toastEl }
		this.toasts.push(toast)

		document.body.appendChild(toastEl)

		setTimeout(() => {
			const index = this.toasts.indexOf(toast)
			if (index !== -1) {
				this.toasts[index].element.remove()
				this.toasts.splice(index, 1)
			}
		}, duration)

		this.moveToasts()
	}

	private moveToasts() {
		const spacing = 20
		let y = 20
		const toasts = this.toasts.toReversed()
		for (const toast of toasts) {
			toast.element.style.top = `${y}px`
			y += toast.element.clientHeight + spacing
		}
	}
}
