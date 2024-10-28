import { DatabaseProxy, DatabaseProxyFactory } from '@database/DatabaseProxy'
import { error, info, log, REST } from '../../Core/Common/utils'
import ExampleEmoteProvider from './ExampleEmoteProvider'
import ExampleDatabase from './Database/ExampleDatabase'
import { Extension } from '../Extension'
import Dexie from 'dexie'

export default class ExampleExtension extends Extension {
	name = 'Example'
	version = '1.0.0'
	description = 'Example extension for emote support'

	private database: DatabaseProxy<ExampleDatabase>
	private sessionCreateCb: (session: Session) => void

	constructor(rootContext: RootContext, sessions: Session[]) {
		super(rootContext, sessions)

		this.sessionCreateCb = this.onSessionCreate.bind(this)

		this.database = __USERSCRIPT__
			? DatabaseProxyFactory.create('NTV_Ext_Example', new ExampleDatabase())
			: DatabaseProxyFactory.create('NTV_Ext_Example')

		this.loadDatabase()
	}

	async init() {
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
			this.database
				.checkCompatibility()
				.then(() => {
					log('Example database passed compatibility check.')
					resolve(void 0)
				})
				.catch((err: Error) => {
					error('Failed to open Example database because:', err)
					reject('Failed to open Example database because: ' + err)
				})
		})
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
		session.emotesManager.registerProvider(ExampleEmoteProvider)
	}
}
