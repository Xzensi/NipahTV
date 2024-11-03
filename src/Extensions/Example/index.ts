import { DatabaseProxy, DatabaseProxyFactory } from '@database/DatabaseProxy'
import ExampleEmoteProvider from './ExampleEmoteProvider'
import ExampleDatabase from './Database/ExampleDatabase'
import { Extension } from '../Extension'
import Dexie from 'dexie'
import { Logger } from '@core/Common/Logger'

const logger = new Logger()
const { log, info, error } = logger.destruct()

export default class ExampleExtension extends Extension {
	name = 'Example'
	version = '1.0.0'
	description = 'Example extension for emote support'

	private database?: DatabaseProxy<ExampleDatabase>
	private sessionCreateCb: (session: Session) => void

	constructor(rootContext: RootContext, sessions: Session[]) {
		super(rootContext, sessions)

		this.sessionCreateCb = this.onSessionCreate.bind(this)
	}

	async init() {
		this.database = __USERSCRIPT__
			? DatabaseProxyFactory.create('NTV_Ext_Example', new ExampleDatabase())
			: DatabaseProxyFactory.create('NTV_Ext_Example')

		return this.loadDatabase()
	}

	/**
	 * Used in service worker to create the database instance for browser extensions.
	 */
	static getExtensionDatabase() {
		return new ExampleDatabase(Dexie)
	}

	loadDatabase() {
		return new Promise((resolve, reject) => {
			if (!this.database) return reject('Database is not initialized')
			this.database
				.checkCompatibility()
				.then(() => {
					log('EXT:EXAMPLE', 'INIT', 'Example database passed compatibility check.')
					resolve(void 0)
				})
				.catch((err: Error) => {
					error('EXT:EXAMPLE', 'INIT', 'Failed to open Example database because:', err)
					reject('Failed to open Example database because: ' + err)
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
				error('EXT:EXAMPLE', 'INIT', `Failed to initialize ${this.name} extension`)
			})
	}

	onDisable() {
		info('EXT:EXAMPLE', 'MAIN', 'Disabling extension:', this.name, this.version)

		const { eventBus: rootEventBus } = this.rootContext
		rootEventBus.unsubscribe('ntv.session.create', this.sessionCreateCb)
	}

	onSessionCreate(session: Session) {
		this.registerEmoteProvider(session)
	}

	registerEmoteProvider(session: Session) {
		session.emotesManager.registerProvider(ExampleEmoteProvider)
	}
}
