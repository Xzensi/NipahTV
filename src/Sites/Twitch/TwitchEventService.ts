import { EventData, EventService } from '@core/Common/EventService'

export default class TwitchEventService implements EventService {
	connect(channelData: ChannelData) {}

	subToChatroomEvents(channelData: ChannelData) {}

	addEventListener<K extends keyof EventData>(
		channelData: ChannelData,
		event: K,
		callback: (data: EventData[K]) => void
	) {}

	disconnect(channelData: ChannelData) {}

	disconnectAll() {}
}
