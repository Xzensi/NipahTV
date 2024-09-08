export enum PLATFORM_ENUM {
	NULL = 'null',
	KICK = 'kick',
	TWITCH = 'twitch',
	YOUTUBE = 'youtube'
}

export enum PROVIDER_ENUM {
	NULL,
	KICK,
	SEVENTV
}

export const U_TAG_LATIN_A = String.fromCodePoint(0xe0041)
export const U_TAG_LATIN_B = String.fromCodePoint(0xe0042)
export const U_TAG_LATIN_C = String.fromCodePoint(0xe0043)
export const U_TAG_LATIN_D = String.fromCodePoint(0xe0044)
export const U_TAG_LATIN_E = String.fromCodePoint(0xe0045)
export const U_TAG_LATIN_F = String.fromCodePoint(0xe0046)
export const U_TAG_LATIN_G = String.fromCodePoint(0xe0047)
export const U_TAG_LATIN_H = String.fromCodePoint(0xe0048)
export const U_TAG_LATIN_I = String.fromCodePoint(0xe0049)
export const U_TAG_LATIN_J = String.fromCodePoint(0xe004a)
export const U_TAG_LATIN_K = String.fromCodePoint(0xe004b)
export const U_TAG_LATIN_L = String.fromCodePoint(0xe004c)
export const U_TAG_LATIN_M = String.fromCodePoint(0xe004d)
export const U_TAG_LATIN_N = String.fromCodePoint(0xe004e)
export const U_TAG_LATIN_O = String.fromCodePoint(0xe004f)
export const U_TAG_LATIN_P = String.fromCodePoint(0xe0050)
export const U_TAG_LATIN_Q = String.fromCodePoint(0xe0051)
export const U_TAG_LATIN_R = String.fromCodePoint(0xe0052)
export const U_TAG_LATIN_S = String.fromCodePoint(0xe0053)
export const U_TAG_LATIN_T = String.fromCodePoint(0xe0054)
export const U_TAG_LATIN_U = String.fromCodePoint(0xe0055)
export const U_TAG_LATIN_V = String.fromCodePoint(0xe0056)
export const U_TAG_LATIN_W = String.fromCodePoint(0xe0057)
export const U_TAG_LATIN_X = String.fromCodePoint(0xe0058)
export const U_TAG_LATIN_Y = String.fromCodePoint(0xe0059)
export const U_TAG_LATIN_Z = String.fromCodePoint(0xe005a)

export const U_TAG_DIGIT_0 = String.fromCodePoint(0xe0030)
export const U_TAG_DIGIT_1 = String.fromCodePoint(0xe0031)
export const U_TAG_DIGIT_2 = String.fromCodePoint(0xe0032)
export const U_TAG_DIGIT_3 = String.fromCodePoint(0xe0033)
export const U_TAG_DIGIT_4 = String.fromCodePoint(0xe0034)
export const U_TAG_DIGIT_5 = String.fromCodePoint(0xe0035)
export const U_TAG_DIGIT_6 = String.fromCodePoint(0xe0036)
export const U_TAG_DIGIT_7 = String.fromCodePoint(0xe0037)
export const U_TAG_DIGIT_8 = String.fromCodePoint(0xe0038)
export const U_TAG_DIGIT_9 = String.fromCodePoint(0xe0039)

export const U_TAG_SPACE = String.fromCodePoint(0xe0020)
export const U_TAG_EXCLAMATION_MARK = String.fromCodePoint(0xe0021)
export const U_TAG_COMMERCIAL_AT = String.fromCodePoint(0xe0040)
export const U_TAG_CANCEL = String.fromCodePoint(0xe007f)

// Any larger tag than this will trigger Kick spam filter when sending 1 character messages
//  because the tag is longer than the message itself, so similarity between messages
//  is too high, even if previous message was not your own.
//
// Kick's message spam filter is absolutely and utterly broken.
export const U_TAG_NTV = U_TAG_LATIN_N + U_TAG_LATIN_T + U_TAG_LATIN_V
export const U_TAG_NTV_AFFIX = U_TAG_EXCLAMATION_MARK //U_TAG_COMMERCIAL_AT + U_TAG_NTV + U_TAG_CANCEL
