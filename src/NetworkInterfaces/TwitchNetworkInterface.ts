import { REST, info } from '../utils'
import { AbstractNetworkInterface } from './AbstractNetworkInterface'

export class TwitchNetworkInterface extends AbstractNetworkInterface {
	constructor() {
		super()
	}

	async connect() {
		return Promise.resolve()
	}

	async disconnect() {
		return Promise.resolve()
	}

	async loadChannelData() {
		throw new Error('Method not implemented.')
	}

	async sendMessage(message: string) {
		throw new Error('Method not implemented.')
	}

	async sendCommand(command: { name: string; args: string[] }) {
		throw new Error('Method not implemented.')
	}
}
