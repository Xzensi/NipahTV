import { NavigatableEntriesWindowComponent } from '../../UserInterface/Components/NavigatableEntriesWindowComponent'
import type { ContentEditableEditor } from '../ContentEditableEditor'
import { error } from '../../utils'

export abstract class AbstractCompletionStrategy {
	protected abstract id: string
	protected navWindow?: NavigatableEntriesWindowComponent
	protected containerEl: HTMLElement

	destroyed: boolean = false

	constructor(containerEl: HTMLElement) {
		this.containerEl = containerEl
	}

	handleKeyDown(event: KeyboardEvent) {}
	handleKeyUp(event: KeyboardEvent) {}
	handleSubmitButton(event: MouseEvent) {}

	static shouldUseStrategy(event: Event, contentEditableEditor: ContentEditableEditor): boolean {
		/**
		 * Typescript sadly does not support static members in interfaces yet,
		 *   so we deal with it this way.
		 */
		throw new Error('Method not implemented.')
	}

	createModal() {
		if (this.navWindow) return error('Tab completion window already exists')

		const navWindow = new NavigatableEntriesWindowComponent(
			this.containerEl as HTMLElement,
			'ntv__' + this.id + '-window'
		)
		this.navWindow = navWindow.init()
	}

	destroyModal() {
		if (!this.navWindow) return error('Tab completion window does not exist yet')
		this.navWindow.destroy()
		delete this.navWindow
	}

	isClickInsideNavWindow(node: Node) {
		return this.navWindow?.containsNode(node) || false
	}

	isShowingNavWindow() {
		return !!this.navWindow
	}

	destroy() {
		if (this.navWindow) this.destroyModal()
		delete this.navWindow
		this.destroyed = true
	}
}
