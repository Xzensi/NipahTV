export class Logger {
	prefix: string
	brandStyle: string
	okStyle: string
	infoStyle: string
	errorStyle: string
	eventStyle: string
	extraMargin: (x?: number) => string
	tagStyle: string

	constructor() {
		this.prefix = 'NIPAH'
		this.brandStyle = `background-color: #91152e; border-left-color: #660002;`
		this.okStyle = `background-color: #178714; border-left-color: #186200;`
		this.infoStyle = `background-color: #394adf; border-left-color: #1629d1;`
		this.errorStyle = `background-color: #91152e; border-left-color: #660002;`
		this.eventStyle = `background-color: #9d7a11; border-left-color: #6f4e00;`
		// line-height: 1.618em;
		this.extraMargin = (x = 0) => `margin-right: ${0.7 + x}em;`
		this.tagStyle = `
			border-left: 0.3em solid white;
			vertical-align: middle;
			margin-right: 0.618em;
			font-size: 1.209em;
			padding: 0 0.618em;
			border-radius: 4px;
			font-weight: bold;
			color: white;
        `
	}

	log(...args: any[]) {
		console.log(
			`%c${this.prefix}%cOK%c`,
			this.tagStyle + this.brandStyle,
			this.tagStyle + this.okStyle + this.extraMargin(1),
			'',
			...args
		)
	}

	info(...args: any[]) {
		console.log(
			`%c${this.prefix}%cINFO%c`,
			this.tagStyle + this.brandStyle,
			this.tagStyle + this.infoStyle + this.extraMargin(),
			'',
			...args
		)
	}

	error(...args: any[]) {
		console.error(
			`%c${this.prefix}%cERROR%c`,
			this.tagStyle + this.brandStyle,
			this.tagStyle + this.errorStyle + this.extraMargin(),
			'',
			...args
		)
	}

	logEvent(event: string, ...args: any[]) {
		console.log(
			`%c${this.prefix}%cEVENT%c`,
			this.tagStyle + this.brandStyle,
			this.tagStyle + this.eventStyle + this.extraMargin(-0.595),
			'',
			event,
			...args
		)
	}
}
