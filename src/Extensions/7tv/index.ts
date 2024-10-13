import SevenTVEmoteProvider from './SevenTVEmoteProvider'
import { error, info, log, REST } from '../../Core/Common/utils'
import { Extension } from '../Extension'

export default class SevenTVExtension extends Extension {
	name = '7TV'
	version = '1.0.0'
	description = '7TV extension for emote support'

	private sessionCreateCb: (session: Session) => void

	constructor(rootContext: RootContext, sessions: Session[]) {
		super(rootContext, sessions)

		this.sessionCreateCb = this.onSessionCreate.bind(this)
	}

	onEnable() {
		info('Enabling extension:', this.name, this.version)

		const { eventBus: rootEventBus, settingsManager } = this.rootContext

		this.sessions.forEach(this.onSessionCreate.bind(this))

		rootEventBus.subscribe('ntv.session.create', this.sessionCreateCb)
	}

	onDisable() {
		info('Disabling extension:', this.name, this.version)

		const { eventBus: rootEventBus } = this.rootContext
		rootEventBus.unsubscribe('ntv.session.create', this.sessionCreateCb)
	}

	onSessionCreate(session: Session) {
		this.registerEmoteProvider(session)
	}

	registerEmoteProvider(session: Session) {
		session.emotesManager.registerProvider(SevenTVEmoteProvider)
	}
}
