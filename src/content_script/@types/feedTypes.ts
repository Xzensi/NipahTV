import { FeedMessageEntry, FeedMessageEntryProcessedData } from '../ui/components/FeedMessage'

export const enum FeedEntryKind {
	Null = 0,
	Message = 1,
	Notification = 2,
	SubscriptionAnnouncement = 3,
	UserCelebration = 4
}

export interface FeedBaseEntry {
	id: string
	kind: FeedEntryKind
	timestamp: number
}

export interface FeedNotificationEntry extends FeedBaseEntry {
	kind: FeedEntryKind.Notification
	content: string
}

export type FeedEntry = FeedMessageEntry | FeedNotificationEntry

export type FeedEntryProcessedData = FeedMessageEntryProcessedData
