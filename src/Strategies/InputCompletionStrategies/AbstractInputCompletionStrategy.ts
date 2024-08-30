import type NavigatableListWindowComponent from '../../UserInterface/Components/NavigatableListWindowComponent'
import type NavigatableListWindowManager from '../../Managers/NavigatableListWindowManager'
import type { ContentEditableEditor } from '../../Classes/ContentEditableEditor'
import { log } from '../../utils'

export default abstract class AbstractInputCompletionStrategy {
	protected abstract id: string
	abstract readonly isFullLineStrategy: boolean

	protected navWindow?: NavigatableListWindowComponent

	public allowInlineStrategyDelegation: boolean = false

	constructor(
		protected rootContext: RootContext,
		protected session: Session,
		protected contentEditableEditor: ContentEditableEditor,
		protected navListWindowManager: NavigatableListWindowManager
	) {}

	abstract shouldUseStrategy(event: KeyboardEvent, contentEditableEditor: ContentEditableEditor): boolean

	clearNavWindow() {
		if (!this.navWindow) return

		this.navWindow.clearEntries()
	}

	isClickInsideNavWindow(node: Node) {
		return this.navWindow?.containsNode(node) || false
	}

	isShowingNavWindow() {
		return !!this.navWindow
	}

	reset() {
		if (this.navWindow) {
			this.navWindow = undefined
			this.navListWindowManager.destroyNavWindow(this.id)
		}
	}

	handleBlockingKeyDownEvent(event: KeyboardEvent): boolean | void {}
	handleKeyDownEvent(event: KeyboardEvent): boolean | void {}
	handleKeyUpEvent(event: KeyboardEvent): boolean | void {}
	handleClickEvent(event: MouseEvent, clickIsInInput: boolean): boolean | void {}
}
