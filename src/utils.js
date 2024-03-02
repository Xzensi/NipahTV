import { Logger } from './Logger'

const logger = new Logger()
export const log = logger.log.bind(logger)
export const logEvent = logger.logEvent.bind(logger)
export const info = logger.info.bind(logger)
export const error = logger.error.bind(logger)

export const assertArgument = (arg, type) => {
	if (typeof arg !== type) {
		throw new Error(`Invalid argument, expected ${type} but got ${typeof arg}`)
	}
}

export const assertArgDefined = arg => {
	if (typeof arg === 'undefined') {
		throw new Error('Invalid argument, expected defined value')
	}
}

export async function fetchJSON(url) {
	return new Promise((resolve, reject) => {
		fetch(url)
			.then(res => res.json())
			.then(resolve)
			.catch(reject)
	})
}

export function isEmpty(obj) {
	for (var x in obj) {
		return false
	}
	return true
}

export function waitForElements(selectors) {
	return new Promise(resolve => {
		let interval
		const checkElements = function () {
			if (selectors.every(selector => document.querySelector(selector))) {
				clearInterval(interval)
				resolve()
			}
		}
		interval = setInterval(checkElements, 100)
		checkElements()
	})
}

export function cleanupHTML(html) {
	return html.replaceAll(/\s\s|\r\n|\r|\n/g, '')
}

// Split emote name into parts for more relevant search results
// Split by uppercase letters, first letter excluded.
//  "pepeDance" -> ["pepe", "Dance"]
//  "PogU" -> ["PogU"], because "U" is too short to be useful
//  "WICKED" -> ["WICKED"]
// export function splitEmoteName(name, minPartLength) {
// 	const parts = []
// 	let part = ''
// 	for (let i = 0; i < name.length; i++) {
// 		const char = name[i]
// 		if (char === char.toUpperCase()) {
// 			if (part.length >= minPartLength) {
// 				parts.push(part)
// 			}
// 			part = char
// 		} else {
// 			part += char
// 		}
// 	}
// 	if (part.length >= minPartLength) {
// 		parts.push(part)
// 	}
// 	return parts
// }

// export function splitEmoteName(name, minPartLength) {
// 	const parts = []
// 	let buffer = name.charAt(0) // Start with the first character.

// 	for (let i = 1; i < name.length; i++) {
// 		const char = name[i]
// 		// Determine if the character is an uppercase letter indicating a new part
// 		if (
// 			char === char.toUpperCase() &&
// 			(buffer.length >= minPartLength || buffer.length + name.slice(i).length < minPartLength)
// 		) {
// 			// If buffer is long enough or adding the rest would not meet minPartLength, start a new part
// 			parts.push(buffer)
// 			buffer = char
// 		} else {
// 			// Otherwise, continue building the current part
// 			buffer += char
// 		}
// 	}

// 	// Ensure the final part is added
// 	if (buffer.length > 0) {
// 		parts.push(buffer)
// 	}

// 	return parts.filter(part => part.length >= minPartLength)
// }

export function splitEmoteName(name, minPartLength) {
	// Return the name as a single part if it's too short or all lowercase or all uppercase
	if (name.length < minPartLength || name === name.toLowerCase() || name === name.toUpperCase()) {
		return [name]
	}

	const parts = []
	let buffer = name[0]
	let lowerCharCount = 1

	for (let i = 1; i < name.length; i++) {
		const char = name[i]

		// Check for uppercase character indicating potential new part
		// We do not split if the part as consecutive lowercase letters forming a word would be shorter than minPartLength
		if (char === char.toUpperCase()) {
			const prevChar = buffer[buffer.length - 1]

			if (prevChar && prevChar === prevChar.toUpperCase()) {
				buffer += char
			} else if (lowerCharCount < minPartLength) {
				buffer += char
			} else {
				parts.push(buffer)
				buffer = char
			}
			lowerCharCount = 0
		} else {
			buffer += char
			lowerCharCount++
		}
	}

	if (buffer.length) {
		if (parts.length && buffer.length < minPartLength) {
			parts[parts.length - 1] += buffer
		} else {
			parts.push(buffer)
		}
	}

	return parts
}
