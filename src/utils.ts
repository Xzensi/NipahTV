import { Logger } from './Classes/Logger'

const logger = new Logger()
export const log = logger.log.bind(logger)
export const logEvent = logger.logEvent.bind(logger)
export const logNow = logger.logNow.bind(logger)
export const info = logger.info.bind(logger)
export const error = logger.error.bind(logger)
export const errorNow = logger.errorNow.bind(logger)

export const CHAR_ZWSP = '\uFEFF'

export const assertArgument = (arg: any, type: string) => {
	if (typeof arg !== type) {
		throw new Error(`Invalid argument, expected ${type} but got ${typeof arg}`)
	}
}

export const assertArray = (arg: Array<any>) => {
	if (!Array.isArray(arg)) {
		throw new Error('Invalid argument, expected array')
	}
}

export const assertArgDefined = (arg: any) => {
	if (typeof arg === 'undefined') {
		throw new Error('Invalid argument, expected defined value')
	}
}

export class REST {
	static get(url: string) {
		return this.fetch(url)
	}
	static post(url: string, data?: object) {
		if (data) {
			return this.fetch(url, {
				method: 'POST',
				body: JSON.stringify(data)
			})
		} else {
			return this.fetch(url, {
				method: 'POST'
			})
		}
	}
	static put(url: string, data: object) {
		return this.fetch(url, {
			method: 'PUT',
			body: JSON.stringify(data)
		})
	}
	static delete(url: string) {
		return this.fetch(url, {
			method: 'DELETE'
		})
	}
	static fetch(url: URL | RequestInfo, options: RequestInit = {}) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest()

			xhr.open(options.method || 'GET', url as string, true)
			xhr.setRequestHeader('accept', 'application/json, text/plain, */*')

			if (options.body || options.method !== 'GET') {
				xhr.setRequestHeader('Content-Type', 'application/json')

				// 	options.headers = Object.assign(options.headers || {}, {
				// 		// 'Content-Type': 'application/json',
				// 		Accept: 'application/json, text/plain, */*'
				// 	})
			}

			const currentDomain = window.location.host.split('.').slice(-2).join('.')
			const urlDomain = new URL(url as string).host.split('.').slice(-2).join('.')
			if (currentDomain === urlDomain) {
				// options.credentials = 'include'
				// options.referrer = window.location.origin + window.location.pathname

				xhr.withCredentials = true
				// w.setRequestHeader('X-Referer', window.location.origin + window.location.pathname)
				// w.setRequestHeader('Referer', window.location.origin + window.location.pathname)

				const XSRFToken = getCookie('XSRF')
				if (XSRFToken) {
					xhr.setRequestHeader('X-XSRF-TOKEN', XSRFToken)
					xhr.setRequestHeader('Authorization', 'Bearer ' + XSRFToken)

					// options.headers = Object.assign(options.headers || {}, {
					// 	'X-XSRF-TOKEN': XSRFToken,
					// 	Authorization: 'Bearer ' + XSRFToken
					// })
				}
			}

			// fetch(url, options)
			// 	.then(async res => {
			// 		const statusString = res.status.toString()
			// 		if (res.redirected) {
			// 			reject('Request failed, redirected to ' + res.url)
			// 		} else if (statusString[0] !== '2' && res.status !== 304) {
			// 			await res
			// 				.json()
			// 				.then(reject)
			// 				.catch(() => {
			// 					reject('Request failed with status code ' + res.status)
			// 				})
			// 		}
			// 		return res
			// 	})
			// 	.then(res => res.json())
			// 	.then(resolve)
			// 	.catch(reject)

			xhr.onload = function () {
				if (xhr.status >= 200 && xhr.status < 300) {
					if (xhr.responseText) resolve(JSON.parse(xhr.responseText))
					else resolve(void 0)
				} else {
					reject('Request failed with status code ' + xhr.status)
				}
			}
			xhr.onerror = function () {
				reject('Request failed')
			}
			xhr.onabort = function () {
				reject('Request aborted')
			}
			xhr.ontimeout = function () {
				reject('Request timed out')
			}

			if (options.body) xhr.send(options.body as string)
			else xhr.send()
		}) as Promise<any | void>
	}
}

/**
 * REST class that sends requests from the main thread to the page context.
 * Uses XMLHttpRequest for Kick because Kasada anti-bot WAF intercepts and decorates it.
 */
export class RESTFromMain {
	requestID = 0
	promiseMap = new Map()

	constructor() {
		document.addEventListener('ntv_upstream', (evt: Event) => {
			const data = JSON.parse((evt as CustomEvent).detail)
			const { rID, xhr } = data
			const { resolve, reject } = this.promiseMap.get(rID)
			this.promiseMap.delete(rID)

			if (xhr.status >= 200 && xhr.status < 300) {
				if (xhr.text) resolve(JSON.parse(xhr.text))
				else resolve(void 0)
			} else {
				reject('Request failed with status code ' + xhr.status)
			}
		})
	}

	async initialize() {
		return new Promise(resolve => {
			// Firefox Manifest V2 does not support content script in execution context MAIN
			//  So we need to inject the page script manually
			if (__FIREFOX_MV2__) {
				const s = document.createElement('script')
				s.src = browser.runtime.getURL('page.js')
				s.onload = function () {
					s.remove()
					resolve(void 0)
				}
				;(document.head || document.documentElement).appendChild(s)
			} else {
				resolve(void 0)
			}
		})
	}

	get(url: string) {
		return this.fetch(url)
	}
	post(url: string, data?: object) {
		if (data) {
			return this.fetch(url, {
				method: 'POST',
				body: JSON.stringify(data)
			})
		} else {
			return this.fetch(url, {
				method: 'POST'
			})
		}
	}
	put(url: string, data: object) {
		return this.fetch(url, {
			method: 'PUT',
			body: JSON.stringify(data)
		})
	}
	delete(url: string) {
		return this.fetch(url, {
			method: 'DELETE'
		})
	}
	fetch(url: URL | RequestInfo, options: RequestInit = {}) {
		if (__EXTENSION__) {
			return new Promise((resolve, reject) => {
				const rID = ++this.requestID
				this.promiseMap.set(rID, { resolve, reject })
				document.dispatchEvent(
					new CustomEvent('ntv_downstream', { detail: JSON.stringify({ rID, url, options }) })
				)
			}) as Promise<any | void>
		} else {
			return REST.fetch(url, options)
		}
	}
}

export function isEmpty(obj: object) {
	for (var x in obj) {
		return false
	}
	return true
}

export function getCookies() {
	return Object.fromEntries(document.cookie.split('; ').map(v => v.split(/=(.*)/s).map(decodeURIComponent)))
}

export function getCookie(name: string) {
	const c = document.cookie
		.split('; ')
		.find(v => v.startsWith(name))
		?.split(/=(.*)/s)
	return c && c[1] ? decodeURIComponent(c[1]) : null
}

export function eventKeyIsLetterDigitPuncSpaceChar(event: KeyboardEvent) {
	if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) return true
	return false
}

export function eventKeyIsLetterDigitPuncChar(event: KeyboardEvent) {
	if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.altKey && !event.metaKey) return true
	return false
}

export function debounce(fn: Function, delay: number) {
	let timeout: NodeJS.Timeout
	return function (...args: any) {
		clearTimeout(timeout)
		timeout = setTimeout(() => fn(...args), delay)
	}
}

export function hex2rgb(hex: string) {
	if (hex.length === 4) {
		let r = hex.slice(1, 2)
		let g = hex.slice(2, 3)
		let b = hex.slice(3, 4)

		return [parseInt(r + r, 16), parseInt(g + g, 16), parseInt(b + b, 16)]
	}

	const r = parseInt(hex.slice(1, 3), 16)
	const g = parseInt(hex.slice(3, 5), 16)
	const b = parseInt(hex.slice(5, 7), 16)

	return [r, g, b]
}

/**
 * Wait for a set of elements to be present in the DOM.
 * Pass an AbortSignal to abort the promise.
 */
export function waitForElements(selectors: Array<string>, timeout = 10000, signal: AbortSignal | null = null) {
	return new Promise((resolve, reject) => {
		let interval: NodeJS.Timeout
		let timeoutTimestamp = Date.now() + timeout

		const checkElements = function () {
			if (selectors.every(selector => document.querySelector(selector))) {
				clearInterval(interval)
				resolve(void 0)
			} else if (Date.now() > timeoutTimestamp) {
				clearInterval(interval)
				reject(new Error('Timeout'))
			}
		}

		interval = setInterval(checkElements, 100)
		checkElements()

		if (signal) {
			signal.addEventListener('abort', () => {
				clearInterval(interval)
				reject(new DOMException('Aborted', 'AbortError'))
			})
		}
	})
}

export function findNodeWithTextContent(element: Element | Document, text: string): Node | null {
	return document.evaluate(
		`//*[text()='${text}']`,
		element || document,
		null,
		XPathResult.FIRST_ORDERED_NODE_TYPE,
		null
	).singleNodeValue
}

export function parseHTML(html: string, firstElement = false) {
	const template = document.createElement('template')
	template.innerHTML = html
	if (firstElement) {
		return template.content.childNodes[0] as HTMLElement
	} else {
		return template.content
	}
}

export function cleanupHTML(html: string) {
	return html.trim().replaceAll(/\s\s|\r\n|\r|\n|	/gm, '')
}

export function countStringOccurrences(str: string, substr: string) {
	let count = 0,
		sl = substr.length,
		post = str.indexOf(substr)
	while (post !== -1) {
		count++
		post = str.indexOf(substr, post + sl)
	}
	return count
}

// Split emote name into parts for more relevant search results
// Split by uppercase letters, first letter excluded.
export function splitEmoteName(name: string, minPartLength: number) {
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

// prettier-ignore
export function md5(inputString: string) {
    var hc="0123456789abcdef";
    function rh(n:number) {var j,s="";for(j=0;j<=3;j++) s+=hc.charAt((n>>(j*8+4))&0x0F)+hc.charAt((n>>(j*8))&0x0F);return s;}
    function ad(x:number,y:number) {var l=(x&0xFFFF)+(y&0xFFFF);var m=(x>>16)+(y>>16)+(l>>16);return (m<<16)|(l&0xFFFF);}
    function rl(n:number,c:number)            {return (n<<c)|(n>>>(32-c));}
    function cm(q:number,a:number,b:number,x:number,s:number,t:number)    {return ad(rl(ad(ad(a,q),ad(x,t)),s),b);}
    function ff(a:number,b:number,c:number,d:number,x:number,s:number,t:number)  {return cm((b&c)|((~b)&d),a,b,x,s,t);}
    function gg(a:number,b:number,c:number,d:number,x:number,s:number,t:number)  {return cm((b&d)|(c&(~d)),a,b,x,s,t);}
    function hh(a:number,b:number,c:number,d:number,x:number,s:number,t:number)  {return cm(b^c^d,a,b,x,s,t);}
    function ii(a:number,b:number,c:number,d:number,x:number,s:number,t:number)  {return cm(c^(b|(~d)),a,b,x,s,t);}
    function sb(x:string) {
        var i;var nblk=((x.length+8)>>6)+1;var blks=new Array(nblk*16);for(i=0;i<nblk*16;i++) blks[i]=0;
        for(i=0;i<x.length;i++) blks[i>>2]|=x.charCodeAt(i)<<((i%4)*8);
        blks[i>>2]|=0x80<<((i%4)*8);blks[nblk*16-2]=x.length*8;return blks;
    }
    var i,x=sb(""+inputString),a=1732584193,b=-271733879,c=-1732584194,d=271733878,olda,oldb,oldc,oldd;
    for(i=0;i<x.length;i+=16) {olda=a;oldb=b;oldc=c;oldd=d;
        a=ff(a,b,c,d,x[i+ 0], 7, -680876936);d=ff(d,a,b,c,x[i+ 1],12, -389564586);c=ff(c,d,a,b,x[i+ 2],17,  606105819);
        b=ff(b,c,d,a,x[i+ 3],22,-1044525330);a=ff(a,b,c,d,x[i+ 4], 7, -176418897);d=ff(d,a,b,c,x[i+ 5],12, 1200080426);
        c=ff(c,d,a,b,x[i+ 6],17,-1473231341);b=ff(b,c,d,a,x[i+ 7],22,  -45705983);a=ff(a,b,c,d,x[i+ 8], 7, 1770035416);
        d=ff(d,a,b,c,x[i+ 9],12,-1958414417);c=ff(c,d,a,b,x[i+10],17,     -42063);b=ff(b,c,d,a,x[i+11],22,-1990404162);
        a=ff(a,b,c,d,x[i+12], 7, 1804603682);d=ff(d,a,b,c,x[i+13],12,  -40341101);c=ff(c,d,a,b,x[i+14],17,-1502002290);
        b=ff(b,c,d,a,x[i+15],22, 1236535329);a=gg(a,b,c,d,x[i+ 1], 5, -165796510);d=gg(d,a,b,c,x[i+ 6], 9,-1069501632);
        c=gg(c,d,a,b,x[i+11],14,  643717713);b=gg(b,c,d,a,x[i+ 0],20, -373897302);a=gg(a,b,c,d,x[i+ 5], 5, -701558691);
        d=gg(d,a,b,c,x[i+10], 9,   38016083);c=gg(c,d,a,b,x[i+15],14, -660478335);b=gg(b,c,d,a,x[i+ 4],20, -405537848);
        a=gg(a,b,c,d,x[i+ 9], 5,  568446438);d=gg(d,a,b,c,x[i+14], 9,-1019803690);c=gg(c,d,a,b,x[i+ 3],14, -187363961);
        b=gg(b,c,d,a,x[i+ 8],20, 1163531501);a=gg(a,b,c,d,x[i+13], 5,-1444681467);d=gg(d,a,b,c,x[i+ 2], 9,  -51403784);
        c=gg(c,d,a,b,x[i+ 7],14, 1735328473);b=gg(b,c,d,a,x[i+12],20,-1926607734);a=hh(a,b,c,d,x[i+ 5], 4,    -378558);
        d=hh(d,a,b,c,x[i+ 8],11,-2022574463);c=hh(c,d,a,b,x[i+11],16, 1839030562);b=hh(b,c,d,a,x[i+14],23,  -35309556);
        a=hh(a,b,c,d,x[i+ 1], 4,-1530992060);d=hh(d,a,b,c,x[i+ 4],11, 1272893353);c=hh(c,d,a,b,x[i+ 7],16, -155497632);
        b=hh(b,c,d,a,x[i+10],23,-1094730640);a=hh(a,b,c,d,x[i+13], 4,  681279174);d=hh(d,a,b,c,x[i+ 0],11, -358537222);
        c=hh(c,d,a,b,x[i+ 3],16, -722521979);b=hh(b,c,d,a,x[i+ 6],23,   76029189);a=hh(a,b,c,d,x[i+ 9], 4, -640364487);
        d=hh(d,a,b,c,x[i+12],11, -421815835);c=hh(c,d,a,b,x[i+15],16,  530742520);b=hh(b,c,d,a,x[i+ 2],23, -995338651);
        a=ii(a,b,c,d,x[i+ 0], 6, -198630844);d=ii(d,a,b,c,x[i+ 7],10, 1126891415);c=ii(c,d,a,b,x[i+14],15,-1416354905);
        b=ii(b,c,d,a,x[i+ 5],21,  -57434055);a=ii(a,b,c,d,x[i+12], 6, 1700485571);d=ii(d,a,b,c,x[i+ 3],10,-1894986606);
        c=ii(c,d,a,b,x[i+10],15,   -1051523);b=ii(b,c,d,a,x[i+ 1],21,-2054922799);a=ii(a,b,c,d,x[i+ 8], 6, 1873313359);
        d=ii(d,a,b,c,x[i+15],10,  -30611744);c=ii(c,d,a,b,x[i+ 6],15,-1560198380);b=ii(b,c,d,a,x[i+13],21, 1309151649);
        a=ii(a,b,c,d,x[i+ 4], 6, -145523070);d=ii(d,a,b,c,x[i+11],10,-1120210379);c=ii(c,d,a,b,x[i+ 2],15,  718787259);
        b=ii(b,c,d,a,x[i+ 9],21, -343485551);a=ad(a,olda);b=ad(b,oldb);c=ad(c,oldc);d=ad(d,oldd);
    }
    return rh(a)+rh(b)+rh(c)+rh(d);
}

/** Check if storage is persisted already.
  @returns {Promise<boolean>} Promise resolved with true if current origin is
  using persistent storage, false if not, and undefined if the API is not
  present.
*/
async function isStoragePersisted() {
	return (await navigator.storage) && navigator.storage.persisted ? navigator.storage.persisted() : undefined
}

/** Tries to convert to persisted storage.
	@returns {Promise<boolean>} Promise resolved with true if successfully
	persisted the storage, false if not, and undefined if the API is not present.
  */
async function persist() {
	return (await navigator.storage) && navigator.storage.persist ? navigator.storage.persist() : undefined
}

/** Queries available disk quota.
	@see https://developer.mozilla.org/en-US/docs/Web/API/StorageEstimate
	@returns {Promise<{quota: number, usage: number}>} Promise resolved with
	{quota: number, usage: number} or undefined.
  */
async function showEstimatedQuota() {
	return (await navigator.storage) && navigator.storage.estimate ? navigator.storage.estimate() : undefined
}

/** Tries to persist storage without ever prompting user.
	@returns {Promise<string>}
	  "never" In case persisting is not ever possible. Caller don't bother
		asking user for permission.
	  "prompt" In case persisting would be possible if prompting user first.
	  "persisted" In case this call successfully silently persisted the storage,
		or if it was already persisted.
  */
// TODO -> https://dexie.org/docs/StorageManager
async function tryPersistWithoutPromtingUser() {
	if (!navigator.storage || !navigator.storage.persisted) {
		return 'never'
	}
	let persisted = await navigator.storage.persisted()
	if (persisted) {
		return 'persisted'
	}
	if (!navigator.permissions || !navigator.permissions.query) {
		return 'prompt' // It MAY be successful to prompt. Don't know.
	}
	const permission = await navigator.permissions.query({
		name: 'persistent-storage'
	})
	if (permission.state === 'granted') {
		persisted = await navigator.storage.persist()
		if (persisted) {
			return 'persisted'
		} else {
			throw new Error('Failed to persist')
		}
	}
	if (permission.state === 'prompt') {
		return 'prompt'
	}
	return 'never'
}

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', {
	numeric: 'auto'
})
const RELATIVE_TIME_DIVISIONS = [
	{ amount: 60, name: 'seconds' },
	{ amount: 60, name: 'minutes' },
	{ amount: 24, name: 'hours' },
	{ amount: 7, name: 'days' },
	{ amount: 4.34524, name: 'weeks' },
	{ amount: 12, name: 'months' },
	{ amount: Number.POSITIVE_INFINITY, name: 'years' }
]
export function formatRelativeTime(date: Date) {
	let duration = (+date - Date.now()) / 1000

	for (let i = 0; i < RELATIVE_TIME_DIVISIONS.length; i++) {
		const division = RELATIVE_TIME_DIVISIONS[i]
		if (Math.abs(duration) < division.amount) {
			return relativeTimeFormatter.format(Math.round(duration), division.name as Intl.RelativeTimeFormatUnit)
		}
		duration /= division.amount
	}

	error('Unable to format relative time', date)
	return 'error'
}
