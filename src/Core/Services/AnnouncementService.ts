import AnnouncementModal from '@core/UI/Modals/AnnouncementModal'
import type SettingsManager from '@core/Settings/SettingsManager'
import type Publisher from '@core/Common/Publisher'
import { Logger } from '@core/Common/Logger'

const logger = new Logger()
const { log, info, error } = logger.destruct()

export interface Announcement {
	id: string
	title?: string
	message: string
	showDontShowAgainButton?: boolean
	showCloseButton?: boolean
	dateTimeRange?: [Date] | [Date, Date]
}

export default class AnnouncementService {
	private announcements: { [key: string]: Announcement } = {}
	private closedAnnouncements: { [key: string]: Date } = {}
	private queuedAnnouncements: Announcement[] = []
	private currentAnnouncement: Announcement | null = null

	constructor(private rootEventBus: Publisher, private settingsManager: SettingsManager) {
		settingsManager.registerSetting(PLATFORM, 'shared', 'announcements', {})

		this.rootEventBus.subscribe('ntv.settings.loaded', this.initialize.bind(this), true)
	}

	async initialize() {
		const { settingsManager } = this

		this.closedAnnouncements = settingsManager.getSetting('shared', 'announcements') as { [key: string]: Date }
	}

	registerAnnouncement(announcement: Announcement) {
		if (this.announcements[announcement.id])
			return log('SERVICE', 'ANNOUNCE', 'Announcement already registered:', announcement.id)

		const isClosed = this.closedAnnouncements[announcement.id] !== undefined
		if (isClosed) return

		// Check if the announcement is within the date range
		if (announcement.dateTimeRange) {
			const now = new Date()

			if (announcement.dateTimeRange.length === 1) {
				const [end] = announcement.dateTimeRange
				if (now > end) return
			} else {
				const [start, end] = announcement.dateTimeRange
				if (now < start || now > end) return
			}
		}

		if (undefined === announcement.showDontShowAgainButton) {
			announcement.showDontShowAgainButton = true
		}

		this.announcements[announcement.id] = announcement
	}

	hasAnnouncement(id: string) {
		return this.announcements[id] !== undefined
	}

	private showNextAnnouncement() {
		if (this.queuedAnnouncements.length) {
			this.currentAnnouncement = this.queuedAnnouncements.shift()!
			this.displayAnnouncement(this.currentAnnouncement.id)
		} else {
			this.currentAnnouncement = null
		}
	}

	async closeAnnouncement(id: string) {
		this.closedAnnouncements[id] = new Date()
		await this.settingsManager.setSetting(PLATFORM, 'shared', 'announcements', this.closedAnnouncements)
	}

	displayAnnouncement(id: string) {
		if (this.closedAnnouncements[id]) return

		if (this.currentAnnouncement && this.currentAnnouncement.id !== id) {
			this.queuedAnnouncements.push(this.announcements[id])
			return
		}

		// Clean up any old modals
		const oldModal = document.querySelectorAll(`.ntv__modal[data-announcement-id="${id}"]`)
		if (oldModal.length) {
			Array.from(oldModal).forEach(el => el.remove())
		}

		this.currentAnnouncement = this.announcements[id]

		const announcement = this.currentAnnouncement
		const modal = new AnnouncementModal(announcement).init()

		modal.addEventListener('acknowledged_announcement', () => this.closeAnnouncement(announcement.id))
		modal.addEventListener('destroy', () => {
			this.currentAnnouncement = null
			this.showNextAnnouncement()
		})
	}
}
