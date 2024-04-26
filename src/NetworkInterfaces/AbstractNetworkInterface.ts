export abstract class AbstractNetworkInterface {
	channelData?: ChannelData

	constructor() {}

	abstract connect(): Promise<any>
	abstract disconnect(): Promise<any>
	abstract loadChannelData(): Promise<any>
	abstract sendMessage(message: string): Promise<any>
	abstract sendCommand(command: { name: string; args: string[] }): Promise<any>
}
