import NavigatableListWindowComponent from '../UI/Components/NavigatableListWindowComponent'

export default class NavigatableListWindowManager {
	private navWindows: Map<string, NavigatableListWindowComponent> = new Map()

	constructor(private containerEl: HTMLElement) {}

	createNavWindow(id: string): NavigatableListWindowComponent {
		if (this.navWindows.has(id)) {
			throw new Error(`Navigatable list window with ID ${id} already exists.`)
		}

		const navWindow = new NavigatableListWindowComponent(this.containerEl, `ntv__${id}-window`)
		navWindow.init()
		this.navWindows.set(id, navWindow)

		return navWindow
	}

	getNavWindow(id: string): NavigatableListWindowComponent | undefined {
		return this.navWindows.get(id)
	}

	hasNavListWindows(): boolean {
		return this.navWindows.size > 0
	}

	destroyNavWindow(id: string): void {
		const navWindow = this.navWindows.get(id)
		if (navWindow) {
			navWindow.destroy()
			this.navWindows.delete(id)
		}
	}

	destroyAllWindows(): void {
		this.navWindows.forEach(navWindow => navWindow.destroy())
		this.navWindows.clear()
	}
}
