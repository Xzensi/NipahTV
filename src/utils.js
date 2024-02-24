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
