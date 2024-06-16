console.log('[NIPAH] [ContentScripts/Page] Loaded')

document.addEventListener('ntv_downstream', function (evt: Event) {
	const data = JSON.parse((evt as CustomEvent).detail)
	const { rID, url, options } = data
	const xhr = new XMLHttpRequest()

	xhr.open(options.method || 'GET', url, true)
	xhr.setRequestHeader('accept', 'application/json, text/plain, */*')

	if (options.body || options.method !== 'GET') {
		xhr.setRequestHeader('Content-Type', 'application/json')
	}

	const currentDomain = window.location.host.split('.').slice(-2).join('.')
	const urlDomain = new URL(url).host.split('.').slice(-2).join('.')
	if (currentDomain === urlDomain) {
		xhr.withCredentials = true

		const c = document.cookie
			.split('; ')
			.find(v => v.startsWith('XSRF'))
			?.split(/=(.*)/s)

		const XSRFToken = c && c[1] ? decodeURIComponent(c[1]) : null
		if (XSRFToken) {
			xhr.setRequestHeader('X-XSRF-TOKEN', XSRFToken)
			xhr.setRequestHeader('Authorization', 'Bearer ' + XSRFToken)
		}
	}

	xhr.onload = function () {
		document.dispatchEvent(
			new CustomEvent('ntv_upstream', {
				detail: JSON.stringify({ rID, xhr: { status: xhr.status, text: xhr.responseText } })
			})
		)
	}
	xhr.onerror = function () {
		console.error('[NIPAH] [RESTAsPage] Request failed')
		document.dispatchEvent(
			new CustomEvent('ntv_upstream', {
				detail: JSON.stringify({ rID, xhr: { status: xhr.status, text: xhr.responseText } })
			})
		)
	}
	xhr.onabort = function () {
		console.error('[NIPAH] [RESTAsPage] Request aborted')
		document.dispatchEvent(
			new CustomEvent('ntv_upstream', {
				detail: JSON.stringify({ rID, xhr: { status: xhr.status, text: xhr.responseText } })
			})
		)
	}
	xhr.ontimeout = function () {
		console.error('[NIPAH] [RESTAsPage] Request timed out')
		document.dispatchEvent(
			new CustomEvent('ntv_upstream', {
				detail: JSON.stringify({ rID, xhr: { status: xhr.status, text: xhr.responseText } })
			})
		)
	}

	if (options.body) xhr.send(options.body)
	else xhr.send()
})
