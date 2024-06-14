import { AbstractEmoteProvider } from './AbstractEmoteProvider'

export type Badge = {
	type: string
	label: string
	active: boolean
	count?: number // E.g. number of months subscribed
}

export interface IBadgeProvider {
	initialize(): void
	getBadge(badge: Badge): string | void
}
