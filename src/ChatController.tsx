import { CustomEventTarget, TypedCustomEvent } from 'Common/TypedCustomEvent'
import { Message } from 'Components/Message'
import { ulid } from 'utils'

const { log, error } = console

const randomMessages = [
	"Imagine losing that fight... couldn't be me.",
	'Skill issue. 🫡',
	'Chat is always right, streamer.',
	'Ratio + L + uninstall.',
	'Who asked? Literally no one.',
	'Peak gameplay right here. 🙄',
	'Alt+F4 for pro strats.',
	'Clueless detected.',
	'Streamer diff. 😤',
	"You're actually throwing for content, right?",
	'Bruh, my grandma plays better than this.',
	'Frame-perfect choke.',
	'Certified Twitch moment.',
	'First-time chatter, last-time viewer.',
	"Where's the refund button?",
	'Any primers in chat?',
	'Actual bot gameplay.',
	"Streamer reading chat like it's Dark Souls lore.",
	"Just get good. It's not that hard.",
	'Your ping has better aim than you',

	'Pog Pog Pog Pog Pog!',
	"That's gotta be illegal, right?",
	'BRUH. BRUH. BRUH.',
	'OMEGALUL moment.',
	'Streamer just went Super Saiyan.',
	'Chat, we witnessing history.',
	"THEY DIDN'T MISS??",
	'SAVE THE CLIP!!',
	'This stream is getting spicy. 🌶️',
	'NO WAY THAT JUST HAPPENED.',

	"Wow, you're so cracked, streamer. 😐",
	'Big brain play right there. Huge. 🧠',
	'That was 100% calculated.',
	"The content we didn't ask for but got anyway.",
	"Streamer, blink twice if you're okay.",
	'Is this an ASMR stream or what?',
	'Yo, speedrun to uninstall?',
	'Pog gameplay... not.',
	'Streamer gaming with their monitor off.',
	"This is why aliens don't visit us.",

	'Is this pre-recorded? 😏',
	'Alt-tab for free skins.',
	'Press F to pay respects.',
	'Streamer: How do you breathe manually?',
	'Touch grass, streamer.',
	'Backseat gaming to save the stream.',
	"We're all here for the tutorial.",
	"Streamer, you're muted. 😈",
	'Left-click harder!',
	'Your GPU is crying.',

	'Based and lag-pilled.',
	'Streamer needs some milk.',
	'Gaming chair buff expired.',
	'Blame RNG and move on.',
	"Streamer's PC is powered by a potato.",
	'This run sponsored by Copium.',
	'Elon Musk plays better on Mars.',
	'This gameplay is giving me anxiety.',
	"Streamer unlocked the secret 'bad ending.'",
	'Certified hood classic gameplay.',

	'That was INSANE! Can we get some PogChamp in chat for that play? 🔥',
	"Streamer, that was absolutely clutch! You're on fire right now!",
	"OMG, you did it! That was such an epic moment! Chat, let's celebrate!",
	"You're absolutely popping off today—keep riding that momentum!",
	"No way you just pulled that off! We're witnessing greatness right here.",
	"Let's gooooo! That's what we're talking about! You're a beast!",
	'Your hard work just paid off big time. That was a masterpiece of a play!',
	'Big brain moves right there! This is why we love watching you!',
	"That was the comeback of the century. We're so proud of you!",
	"Absolutely smashed it! You're the MVP of the day for sure.",

	'Wow, the way you handled that situation was pure skill. Well done!',
	"That move you pulled off was crazy impressive. You're really in the zone today!",
	'Your creativity in how you approach these challenges is unmatched. Love watching you play!',
	"Streamer, your game sense is next-level. Seriously, keep doing what you're doing!",
	'The amount of focus you put into this is inspiring. Mad respect. 👊',
	"Honestly, even when things don't go as planned, you still make it entertaining!",
	"That clutch moment just now? Absolute chef's kiss. 🧑‍🍳💋",
	'Streamer, your adaptability is what makes you so fun to watch. Keep being awesome!',
	"The way you've learned from your mistakes in this game is honestly super motivating.",
	"You're turning into a pro in front of our eyes. Keep up the amazing progress!"

	// 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nullam nec purus nec nunc ultricies tincidunt. Nam ac nulla nec orci aliquet tincidunt. Quisque nec odio sit amet metus aliquam sodales. Etiam eget elit nec sapien ultricies tincidunt.',
	// 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nullam nec purus nec nunc ultricies tincidunt. Nam ac nulla nec orci aliquet tincidunt. Quisque nec odio sit amet metus aliquam sodales. Etiam eget elit nec sapien ultricies tincidunt. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
	// 'Nam ac nulla nec orci aliquet tincidunt. Quisque nec odio sit amet metus aliquam sodales. Etiam eget elit nec sapien ultricies tincidunt. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nullam nec purus nec nunce ultricies tincidunt.'
]

const randomUsernames = [
	'EpicGamer420BlazeIt',
	'ToasterPoweredPC',
	'UwU_Domination',
	'SniperNoSniping69',
	'Xx_DarkSoulz_xX',
	'CaptainClutch',
	'PixelPanic99',
	'YeetAndDelete',
	'LootGoblinSupreme',
	'KrakenSnackz',
	'RageQuitAndChill',
	'LaggyMcLaggerson',
	'StealthySausage',
	'QuantumDuck',
	'GigaChadPlays',
	'BoomHeadshottt',
	'WaffleOverlord',
	'ChatLovesChaos',
	'GhostInTheChat',
	'TurboTurtleXP',
	'AFKAndWinning',
	'KeyboardSmasher',
	'StreamerFuelz',
	'MemeMachineX',
	'SpicyNoodleSpeedrun',
	'FPS_FluffyPanda',
	'PotatoAimForever',
	'ShroudOfSecrets',
	'NekoWithNades',
	'Level99GigaBrain',
	'SnaccAttack',
	'BananaBreadGamer',
	'GGnoREpls',
	'TrashPandaPlays',
	'SpeedrunSimp',
	'PixelatedPogger',
	'StreamerStonks',
	'VoidHunter420',
	'CringeKiller69',
	'LaserLlama77',
	'ClutchOrKickX',
	'CtrlAltDefeat',
	'GamingWithStyle',
	'BigBrainBonanza',
	'OverkillInstinct',
	'LootLlamaKing',
	'RektItRalph',
	'NoScopeNinjaX',
	'ElitePotatoLord',
	'SaltySeagullz',
	'VictoryVibesOnly',
	'PogFrog999',
	'SuperNovaNoob',
	'FailFishMaster',
	'StealthyWalrus',
	'UnicornInDisguise',
	'KeyboardKommander',
	'GameGlitchGuru',
	'CriticalCrab',
	'PixelOverlord',
	'ChocoChipChamp',
	'AnimeTrash99',
	'NaniDesuKappa',
	'UltimateDerpMode',
	'LegendOfLag',
	'EpicLootGoblin',
	'RespawnJunkie',
	'YeetTheBeat',
	'ProcrastinationKing',
	'NoobMaster420X',
	'RadicalRexPlays',
	'CheeseOverload',
	'SilentPoggers',
	'ZombieSlayer9000',
	'FluffyFerretXD',
	'PewPewPineapple',
	'ClownCarDriver',
	'WreckingCrew999',
	'SneakyBeakyLOL',
	'CyberPugGaming',
	'DarkModeChampion',
	'PixelPugLife',
	'OverclockedPenguin',
	'GamerWithGlasses',
	'DriftKing42',
	'ChillAndKill',
	'RavenousRaptor',
	'SweatySockGaming',
	'NoLootLeft4U',
	'ChadWithABow',
	'TrashTalkTitan',
	'PwnedAndOwned',
	'StreamerDreamer',
	'DerpDragon64',
	'PixelKnightX',
	'EpicElfSniper',
	'TurboGamerX69',
	'RogueDucklings'
]

function getRandomMessage() {
	return {
		id: ulid(),
		username: randomUsernames[Math.floor(Math.random() * randomUsernames.length)],
		content: randomMessages[Math.floor(Math.random() * randomMessages.length)]
	}
}

const messagesDataStoreMaxCapacity = 10_000
// const messagesDataStore = Array.from({ length: messagesDataStoreMaxCapacity }, getRandomMessage)

interface ChatControllerEventMap {
	message: Message
}

export default class ChatController {
	eventTarget = new EventTarget() as CustomEventTarget<ChatControllerEventMap>
	messages: Message[] = []
	count: number = 0

	addEventListener<T extends keyof ChatControllerEventMap>(
		type: T,
		listener: (ev: CustomEvent<ChatControllerEventMap[T]>) => any,
		options?: boolean | AddEventListenerOptions
	) {
		this.eventTarget.addEventListener(type, listener, options)
	}

	getChunk(startIndex: number, endIndex: number) {
		if (startIndex < 0) startIndex = 0
		if (endIndex < 0) endIndex = 0
		if (endIndex < startIndex) endIndex = startIndex
		return this.messages.slice(startIndex, endIndex)
	}

	getChunkId(id: string, count: number) {
		if (count < 1) {
			error('Attempted to get a chunk of messages with a count less than 1')
			count = 1
		}

		const index = this.messages.findLastIndex(message => message.id === id)
		if (index === -1) return null

		return this.messages.slice(index, index + count)
	}

	getHeadIndex() {
		return this.messages.length - 1
	}

	getHeadId() {
		return this.messages[this.messages.length - 1]?.id
	}

	getAheadCountById(id: string) {
		const index = this.messages.findLastIndex(message => message.id === id)
		if (index === -1) return 0

		return this.messages.length - index - 1
	}

	simulateMessage() {
		const message = getRandomMessage()
		message.content = `[${++this.count}] ` + message.content
		this.messages.push(message)

		if (this.messages.length > messagesDataStoreMaxCapacity) {
			this.messages.shift()
		}

		this.eventTarget.dispatchEvent(new TypedCustomEvent('message', { detail: message }))
	}
}
