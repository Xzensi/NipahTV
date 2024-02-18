export class AbstractUserInterface {
	/**
	 * @param {EventBus} eventBus
	 * @param {object} deps
	 */
	constructor({ ENV_VARS, eventBus, settingsManager, emotesManager }) {
		if (ENV_VARS === undefined) throw new Error('ENV_VARS is required')
		if (eventBus === undefined) throw new Error('eventBus is required')
		if (emotesManager === undefined) throw new Error('emotesManager is required')
		if (settingsManager === undefined) throw new Error('settingsManager is required')

		this.ENV_VARS = ENV_VARS
		this.eventBus = eventBus
		this.settingsManager = settingsManager
		this.emotesManager = emotesManager
	}

	loadInterface() {
		throw new Error('loadInterface() not implemented')
	}
}
