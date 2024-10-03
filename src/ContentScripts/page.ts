console.log('[NIPAH] [ContentScripts/Page] Loaded')

document.addEventListener('ntv_downstream', function (evt: Event) {
	const data = JSON.parse((evt as CustomEvent).detail)
	const { rID, url, options } = data
	const xhr = new XMLHttpRequest()

	xhr.open(options.method || 'GET', url, true)
	xhr.setRequestHeader('accept', 'application/json, text/plain, */*')

	if (options.body) {
		xhr.setRequestHeader('Content-Type', 'application/json')
	}

	function getCookie(name: string) {
		const c = document.cookie
			.split('; ')
			.find(v => v.startsWith(name))
			?.split(/=(.*)/s)
		return c && c[1] ? decodeURIComponent(c[1]) : null
	}

	const currentDomain = window.location.host.split('.').slice(-2).join('.')
	const urlDomain = new URL(url).host.split('.').slice(-2).join('.')
	if (currentDomain === urlDomain) {
		xhr.withCredentials = true

		const XSRFToken = getCookie('XSRF')
		if (XSRFToken) {
			xhr.setRequestHeader('X-XSRF-TOKEN', XSRFToken)
		}

		const sessionToken = getCookie('session_token')
		if (sessionToken) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + sessionToken)
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

document.addEventListener('ntv_downstream_reactive_props', function (evt: Event) {
	const data = JSON.parse((evt as CustomEvent).detail)
	const { rID, className } = data

	const els = document.getElementsByClassName(className)
	if (els.length === 0 || els.length > 1) {
		console.error('[NIPAH] [RESTAsPage] No elements found with class name:', className)
		document.dispatchEvent(
			new CustomEvent('ntv_upstream_reactive_props', {
				detail: JSON.stringify({ rID, props: false })
			})
		)
		return
	}

	const el = els[0]
	el.classList.remove(className)

	const reactivePropsKey = Object.keys(el).find(key => key.startsWith('__reactProps$'))
	if (!reactivePropsKey) {
		console.error('[NIPAH] [RESTAsPage] No reactive props found')
		document.dispatchEvent(
			new CustomEvent('ntv_upstream_reactive_props', {
				detail: JSON.stringify({ rID, props: false })
			})
		)
		return
	}

	// @ts-expect-error
	const reactivePropsHandle = el[reactivePropsKey]

	const reactiveProps = reactivePropsHandle.children?.props
	if (!reactiveProps) {
		console.error('[NIPAH] [RESTAsPage] No reactive props found')
		document.dispatchEvent(
			new CustomEvent('ntv_upstream_reactive_props', {
				detail: JSON.stringify({ rID, props: false })
			})
		)
		return
	}

	document.dispatchEvent(
		new CustomEvent('ntv_upstream_reactive_props', {
			detail: JSON.stringify({ rID, props: reactiveProps })
		})
	)
})
