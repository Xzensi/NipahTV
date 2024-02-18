export class AbstractComponent {
	// Method to render the component
	render() {
		throw new Error('render() method must be implemented')
	}

	// Method to attach event handlers
	attachEventHandlers() {
		throw new Error('attachEventHandlers() method must be implemented')
	}

	// Method to initialize the component
	init() {
		this.render()
		this.attachEventHandlers()

		return this
	}
}
