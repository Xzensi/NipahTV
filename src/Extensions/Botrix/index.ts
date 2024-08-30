import { error, getPlatformSlug, info, log, REST } from '../../utils'
import { Extension } from '../Extension'
import BotrixExecutionStrategy from './BotrixExecutionStrategy'
import { BotrixInputCompletionStrategy } from './BotrixInputCompletionStrategy'

class BotrixNetworkInterface {
	static async fetchUserShopItems(userSlug: string, platformId: TPlatformId) {
		return REST.get(`https://botrix.live/api/public/shop/items?u=${userSlug}&platform=${platformId}`)
	}
}

export class BotrixSessionManager {
	private userShopItems = []

	constructor(private session: Session) {}

	async getUserShopItems() {
		if (!this.userShopItems.length) {
			const userSlug = this.session.channelData.channelName
			const platformId = getPlatformSlug()
			const userShopItems = await BotrixNetworkInterface.fetchUserShopItems(userSlug, platformId)
			log('User shop items:', userShopItems)

			// TODO solve CORS issues with botrix.live, probably need to use GM_XMLHttpRequest
			// TODO process userShopItems and store them in this.userShopItems
		}
	}
}

export default class BotrixExtension extends Extension {
	name = 'Botrix'
	version = '1.0.0'
	description = 'Botrix extension for the botrix completion strategy'

	private sessionCreateCb: (session: Session) => void

	constructor(rootContext: RootContext, sessions: Session[]) {
		super(rootContext, sessions)

		this.sessionCreateCb = this.onSessionCreate.bind(this)
	}

	onEnable() {
		info('Enabling extension:', this.name, this.version)

		const { eventBus: rootEventBus, settingsManager } = this.rootContext

		this.sessions.forEach(this.registerSessionCompletionStrategy.bind(this))

		rootEventBus.subscribe('ntv.session.create', this.sessionCreateCb)
	}

	onDisable() {
		info('Disabling extension:', this.name, this.version)

		const { eventBus: rootEventBus } = this.rootContext
		rootEventBus.unsubscribe('ntv.session.create', this.sessionCreateCb)

		// this.sessions.forEach(session => {
		// 	session.inputCompletionStrategyRegister.unregisterStrategy(BotrixInputCompletionStrategy)
		// })
	}

	onSessionCreate(session: Session) {
		// this.registerSessionCompletionStrategy(session)
		this.registerSessionExecutionStrategy(session)
	}

	registerSessionExecutionStrategy(session: Session) {
		const { rootContext } = this
		session.inputExecutionStrategyRegister.registerStrategy(new BotrixExecutionStrategy(rootContext, session))
	}

	registerSessionCompletionStrategy(session: Session) {
		const inputController = session.userInterface?.getInputController()
		if (!inputController)
			return error(`No input controller found for extension ${this.name} with session:`, session)

		const inputCompletionStrategyManager = session.inputCompletionStrategyManager
		if (!inputCompletionStrategyManager)
			return error(`No input completion strategy manager found for extension ${this.name} with session:`, session)

		session.inputCompletionStrategyRegister.registerStrategy(
			new BotrixInputCompletionStrategy(
				this.rootContext,
				session,
				inputController.contentEditableEditor,
				inputCompletionStrategyManager.navListWindowManager,
				{ botrixSessionManager: new BotrixSessionManager(session) }
			)
		)
	}
}
