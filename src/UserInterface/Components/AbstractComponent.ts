export class AbstractComponent {
	// Method to render the component
	render() {
		throw new Error('render() method is not implemented yet')
	}

	// Method to attach event handlers
	attachEventHandlers() {
		throw new Error('attachEventHandlers() method is not implemented yet')
	}

	// Method to initialize the component
	init(): this {
		this.render()
		this.attachEventHandlers()

		return this
	}
}
