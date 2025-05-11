import { CustomEventTarget, TypedCustomEvent } from '@Common/TypedCustomEvent'
import { FeedController, FeedEventMap } from '../feed/FeedController'
import { FeedMessageEntry } from '../components/FeedMessage'
import { FeedEntryKind } from '../../@types/feedTypes'
import { ulid } from '@Common/utils'

const { log, error } = console

// peped
// petthemods
// pogU
// prayge
// ratjam
// sniffa
// SUSSY
// xdd
// bedge
// booba
// clueless
// donowall
// gigachad
// hmmge
// huh
// letsgo
// monkasteer
// noooo
// OMEGALUL
// peepohey
// peeporiot
// peeposhy

const randomMessages = [
	'PogU PogU PogU PogU PogU PogU PogU PogU',
	"Imagine losing that fight... couldn't be me. KEKW Jigglin",
	'Skill issue. 🫡 PogU OMEGALUL',
	'Chat is always right, streamer. hmmge forsenCD',
	'Ratio + L + uninstall. SUSSY OMEGALUL xdd',
	'Who asked? Literally no one. DonkAim',
	'Peak gameplay right here. 🙄 OkaygeL KEKW',
	'Alt+F4 for pro strats. PogU PogU',
	'Clueless detected. OMEGALUL',
	'Streamer diff. 😤 PogU forsenCD',
	"You're actually throwing for content, right? hmmge xdd",
	'Bruh, my grandma plays better than this. KEKW Jigglin',
	'Frame-perfect choke. PogU xdd',
	'Certified Twitch moment. OMEGALUL PogU',
	'First-time chatter, last-time viewer. xdd SUSSY',
	"Where's the refund button? KEKW KEKW KEKW",
	'Any SUSSY primers in chat? hmmge PogU',
	'Actual bot gameplay. DonkAim OMEGALUL',
	"Streamer reading chat like it's Dark Souls lore. OkaygeL xdd",
	"Just get good. It's not that hard. PogU KEKW",
	'Your ping has better aim than you. forsenCD PogU',

	'Jigglin Jigglin Jigglin Jigglin Jigglin Jigglin',
	"PogU PogU That's gotta be illegal, right? SUSSY",
	'BRUH. BRUH. BRUH. xdd PogU',
	'OMEGALUL moment. PogU PogU PogU',
	'Streamer just went Super Saiyan. KEKW xdd',
	'Chat, we witnessing history. PogU OMEGALUL',
	"THEY DIDN'T MISS?? KEKW forsenCD",
	'SAVE THE CLIP!! PogU PogU PogU',
	'This stream is getting spicy. 🌶️ hmmge',
	'NO WAY THAT JUST HAPPENED. KEKW Jigglin',

	"Wow, you're so cracked, streamer. 😐 PogU KEKW",
	'Big brain play right there. Huge. 🧠 OMEGALUL SUSSY',
	'That was 100% calculated. PogU DonkAim',
	"The content we didn't ask for but got anyway. PogU PogU",
	"Streamer, blink twice if you're okay. xdd OkaygeL",
	'Is this a SUSSY ASMR stream or what? KEKW forsenCD',
	'Yo, speedrun to uninstall? OMEGALUL PogU',
	'Pog gameplay... not. KEKW KEKW KEKW',
	'Streamer gaming with their monitor off. hmmge xdd',
	"This is why aliens don't visit us. DonkAim PogU",

	'forsenCD forsenCD forsenCD forsenCD forsenCD forsenCD forsenCD',
	'Is this pre-recorded? 😏 KEKW PogU',
	'Alt-tab for free skins. PogU Jigglin',
	'Press F to pay respects. hmmge',
	'Streamer: How do you breathe manually? KEKW PogU',
	'Touch grass, streamer. OMEGALUL PogU',
	'Backseat gaming to save the stream. PogU SUSSY',
	"We're all here for the tutorial. xdd DonkAim",
	"Streamer, you're muted. 😈 KEKW KEKW",
	'Left-click harder! PogU PogU PogU',
	'Your GPU is crying. OMEGALUL PogU',

	'OkaygeL OkaygeL OkaygeL OkaygeL OkaygeL OkaygeL',
	'Based and lag-pilled. KEKW PogU',
	'Streamer needs some milk. PogU Jigglin',
	'Gaming chair buff expired. xdd DonkAim',
	'Blame RNG and move on. KEKW forsenCD',
	"Streamer's PC is powered by a potato. OMEGALUL PogU",
	'This run sponsored by Copium. PogU PogU PogU',
	'Elon Musk plays better on Mars. xdd OkaygeL',
	'This gameplay is giving me anxiety. KEKW KEKW KEKW',
	"Streamer unlocked the secret 'bad ending.' PogU SUSSY",
	'Certified hood classic gameplay. OMEGALUL PogU',

	'PogU PogU PogU PogU PogU PogU PogU PogU PogU',
	'That was INSANE! Can we get some PogChamp in chat for that play? 🔥 PogU PogU PogU',
	"Streamer, that was absolutely clutch! You're on fire right now! KEKW Jigglin",
	"OMG, you did it! That was such an epic moment! Chat, let's celebrate! PogU PogU",
	"You're absolutely popping off today—keep riding that momentum! OMEGALUL xdd",
	"No way you just pulled that off! We're witnessing greatness right here. PogU DonkAim",
	"Let's gooooo! That's what we're talking about! You're a beast! KEKW PogU",
	'Your hard work just paid off big time. That was a masterpiece of a play! PogU PogU PogU',
	'Big brain moves right there! This is why we love watching you! xdd forsenCD',
	"That was the comeback of the century. We're so proud of you! PogU PogU",
	"Absolutely smashed it! You're the MVP of the day for sure. KEKW Jigglin",

	'OMEGALUL OMEGALUL OMEGALUL OMEGALUL OMEGALUL OMEGALUL',
	'Wow, the way you handled that situation was pure skill. Well done! PogU PogU',
	"That move you pulled off was crazy impressive. You're really in the zone today! KEKW Jigglin",
	'Your creativity in how you approach these challenges is unmatched. Love watching you play! PogU OMEGALUL',
	"Streamer, your game sense is next-level. Seriously, keep doing what you're doing! xdd DonkAim",
	'The amount of focus you put into this is inspiring. Mad respect. 👊 OMEGALUL PogU',
	"Honestly, even when things don't go as planned, you still make it entertaining! KEKW PogU",
	"That clutch moment just now? Absolute chef's kiss. 🧑‍🍳💋 PogU PogU",
	'Streamer, your adaptability is what makes you so fun to watch. Keep being awesome! OMEGALUL PogU',
	"The way you've learned from your mistakes in this game is honestly super motivating. PogU PogU",
	"You're turning into a pro in front of our eyes. Keep up the amazing progress! KEKW Jigglin"

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
	'PixelatedPogUger',
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
	'PogUFrog999',
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
	'SilentPogUgers',
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

function getRandomMessage(): FeedMessageEntry {
	return {
		id: ulid(),
		kind: FeedEntryKind.Message,
		timestamp: Date.now(),
		username: randomUsernames[Math.floor(Math.random() * randomUsernames.length)],
		content: randomMessages[Math.floor(Math.random() * randomMessages.length)]
	}
}

const messagesDataStoreMaxCapacity = 10_00_000
// const messagesDataStore = Array.from({ length: messagesDataStoreMaxCapacity }, getRandomMessage)

export default class ChatFeedController
	extends FeedController<FeedMessageEntry>
	implements FeedController<FeedMessageEntry>
{
	eventTarget = new EventTarget() as CustomEventTarget<FeedEventMap<FeedMessageEntry>>
	entries: FeedMessageEntry[] = []
	count: number = 0

	simulateMessage() {
		// const amount = 1
		// const messages = []
		// for (let i = 0; i < amount; i++) {
		const message = getRandomMessage()
		message.content = `[${++this.count}] ` + message.content
		Object.freeze(message) // For testing purposes
		this.entries.push(message)

		if (this.entries.length > messagesDataStoreMaxCapacity) {
			this.entries.shift()
		}
		// messages.push(message)
		// }

		// log(this.entries.length)

		this.eventTarget.dispatchEvent(new TypedCustomEvent('newEntry', { detail: message }))
	}
}
