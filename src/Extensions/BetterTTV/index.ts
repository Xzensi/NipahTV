import { DatabaseProxy, DatabaseProxyFactory } from '@database/DatabaseProxy'
import BetterTTVEmoteProvider from './BetterTTVEmoteProvider'
import BetterTTVDatabase from './Database/BetterTTVDatabase'
import { Logger } from '@core/Common/Logger'
import { Extension } from '../Extension'
import Dexie from 'dexie'

const logger = new Logger()
const { log, info, error } = logger.destruct()

export default class BetterTTVExtension extends Extension {
	name = 'BetterTTV'
	version = '1.0.0'
	description = 'BetterTTV extension for emote support'

	private database?: DatabaseProxy<BetterTTVDatabase>
	private sessionCreateCb: (session: Session) => void

	constructor(rootContext: RootContext, sessions: Session[]) {
		super(rootContext, sessions)

		this.sessionCreateCb = this.onSessionCreate.bind(this)
	}

	async init() {
		this.database = __USERSCRIPT__
			? DatabaseProxyFactory.create('NTV_Ext_BetterTTV', new BetterTTVDatabase())
			: DatabaseProxyFactory.create('NTV_Ext_BetterTTV')

		return this.loadDatabase()
	}

	/**
	 * Used in service worker to create the database instance for browser extensions.
	 */
	static getExtensionDatabase() {
		return new BetterTTVDatabase(Dexie)
	}

	loadDatabase() {
		return new Promise((resolve, reject) => {
			if (!this.database) return reject('Database is not initialized')
			this.database
				.checkCompatibility()
				.then(() => {
					log('EXT:BTTV', 'INIT', 'BetterTTV database passed compatibility check.')
					resolve(void 0)
				})
				.catch((err: Error) => {
					error('EXT:BTTV', 'INIT', 'Failed to open BetterTTV database because:', err)
					reject('Failed to open BetterTTV database because: ' + err)
				})
		})
	}

	onEnable() {
		info('Enabling extension:', this.name, this.version)

		const { eventBus: rootEventBus, settingsManager } = this.rootContext

		this.init()
			.then(() => {
				if (rootEventBus.hasFiredEvent('ntv.session.create'))
					this.sessions.forEach(this.onSessionCreate.bind(this))

				rootEventBus.subscribe('ntv.session.create', this.sessionCreateCb)
			})
			.catch(err => {
				error('EXT:BTTV', 'INIT', `Failed to initialize ${this.name} extension`)
			})
	}

	onDisable() {
		info('EXT:BTTV', 'MAIN', 'Disabling extension:', this.name, this.version)

		const { eventBus: rootEventBus } = this.rootContext
		rootEventBus.unsubscribe('ntv.session.create', this.sessionCreateCb)
	}

	onSessionCreate(session: Session) {
		this.registerEmoteProvider(session)
	}

	registerEmoteProvider(session: Session) {
		session.emotesManager.registerProvider(BetterTTVEmoteProvider)
	}
}
