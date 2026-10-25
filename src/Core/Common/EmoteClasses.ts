export const EMOTE_CLASSES = {
	emote: 'ntv__emote',
	setEmote: 'ntv__emote-set__emote ntv__emote',
	zeroWidth: 'ntv__emote--zero-width'
} as const

export type EmoteClasses = (typeof EMOTE_CLASSES)[keyof typeof EMOTE_CLASSES]
