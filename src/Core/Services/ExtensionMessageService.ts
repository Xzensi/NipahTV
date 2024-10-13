// Service to open ports with background script
// Has method sendMessage to send messages over established port
export default class ExtensionMessageService {
	private port: any

	constructor() {
		this.port = browser.runtime.connect({ name: 'nipahtv_service_worker' })
	}

	sendMessage(message: any) {
		return new Promise((resolve, reject) => {
			this.port.postMessage(message)
			this.port.onMessage.addListener((response: any) => {
				resolve(response)
			})
		})
	}
}
