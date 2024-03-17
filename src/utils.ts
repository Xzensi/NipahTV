import { Logger } from './Classes/Logger'

const logger = new Logger()
export const log = logger.log.bind(logger)
export const logEvent = logger.logEvent.bind(logger)
export const info = logger.info.bind(logger)
export const error = logger.error.bind(logger)

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

export async function fetchJSON(url: URL | RequestInfo) {
	return new Promise((resolve, reject) => {
		fetch(url)
			.then(res => res.json())
			.then(resolve)
			.catch(reject)
	})
}

export function isEmpty(obj: object) {
	for (var x in obj) {
		return false
	}
	return true
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

export function cleanupHTML(html: string) {
	return html.replaceAll(/\s\s|\r\n|\r|\n|	/gm, '')
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
