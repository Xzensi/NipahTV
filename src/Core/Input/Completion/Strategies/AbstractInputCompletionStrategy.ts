import type NavigatableListWindowComponent from '../../../UI/Components/NavigatableListWindowComponent'
import type NavigatableListWindowManager from '../../../Common/NavigatableListWindowManager'
import type { ContentEditableEditor } from '../../ContentEditableEditor'

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

	abstract shouldUseStrategy(event: KeyboardEvent | MouseEvent, contentEditableEditor: ContentEditableEditor): boolean

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
