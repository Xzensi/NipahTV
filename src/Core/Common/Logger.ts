export class Logger {
	private namespaceStyle =
		'background: #b92f4a; color: #fff; border-top-left-radius: 5px; border-bottom-left-radius: 5px;'
	private defaultCategoryStyle = 'background: #6D4C41; color: #fff;'
	private defaultScopeStyle = 'background: white; color: black;'

	private sharedStyle = `
		vertical-align: middle;
		padding: 0.1em 0.6em;
		font-size: 1.2em;`

	private colorStyles: { [key: string]: string } = {
		CORE: 'background: #4E342E; color: #fff;', // Dark brown
		INIT: 'background: #00796B; color: #fff;', // Teal for initialization
		SETUP: 'background: #546E7A; color: #fff;', // Medium blue-gray for setup
		MAIN: 'background: #37474F; color: #fff;', // Darker blue-gray for main/core processes

		UI: 'background: #388E3C; color: #fff;', // Green for UI
		NET: 'background: #0288D1; color: #fff;', // Light blue for network operations

		EVENT: 'background: #8D6E63; color: #fff;', // Lighter brown
		ROOT: 'background: #EF6C00; color: #000;', // Darker orange
		SESSION: 'background: #EF6C00; color: #000;', // Amber

		'EMOT:STORE': 'background: #7E57C2; color: #fff;', // Purple for emote storage
		'EMOT:MGR': 'background: #673AB7; color: #fff;', // Darker purple for emote management
		'EMOT:PROV': 'background: #9575CD; color: #fff;', // Lighter purple for emote providers

		// SITES
		KICK: 'background: #53fc18; color: #000;',

		// SevenTV
		'EXT:STV': 'background: #29d8f6; color: #000;',
		EVENTAPI: 'background: #0288D1; color: #fff;', // Slightly darker blue

		// Botrix
		'EXT:BTX': 'background: #3ab36b; color: #000;'
	}

	private logWithStyles(category: string, scope: string, ...args: any[]): void {
		console.log(
			`%cNTV%c${category.padEnd(7, ' ')}%c${scope.padEnd(9, ' ')}`,
			this.namespaceStyle + this.sharedStyle,
			(this.colorStyles[category] || this.defaultCategoryStyle) + this.sharedStyle, // category color or default
			(this.colorStyles[scope] || this.defaultScopeStyle) + this.sharedStyle + 'margin-right: 0.333em;',
			...args
		)
	}

	log(category: string, scope: string, ...args: any[]): void {
		this.logWithStyles(category, scope, ...args)
	}

	logNow(category: string, scope: string, ...args: any[]) {
		this.log(category, scope, ...structuredClone(args))
	}

	info(category: string, scope: string, ...args: any[]): void {
		this.logWithStyles(category, scope, ...args)
	}

	success(category: string, scope: string, ...args: any[]): void {
		this.logWithStyles(category, scope, ...args)
	}

	warning(category: string, scope: string, ...args: any[]): void {
		console.warn(
			`%cNTV%c${category.padEnd(7, ' ')}%c${scope.padEnd(9, ' ')}`,
			this.namespaceStyle + this.sharedStyle,
			(this.colorStyles[category] || this.defaultCategoryStyle) + this.sharedStyle,
			(this.colorStyles[scope] || 'color: #FFA726;') + this.sharedStyle + 'margin-right: 0.333em;', // scope color (orange for warnings)
			...args
		)
	}

	// Error method that throws a proper console error
	error(category: string, scope: string, ...args: any[]): void {
		console.error(
			`%cNTV%c${category.padEnd(7, ' ')}%c${scope.padEnd(9, ' ')}`,
			this.namespaceStyle + this.sharedStyle,
			(this.colorStyles[category] || this.defaultCategoryStyle) + this.sharedStyle,
			(this.colorStyles[scope] || this.defaultScopeStyle) + this.sharedStyle + 'margin-right: 0.333em;',
			...args
		)
	}

	destruct() {
		return {
			log: this.log.bind(this),
			logNow: this.logNow.bind(this),
			info: this.info.bind(this),
			success: this.success.bind(this),
			warning: this.warning.bind(this),
			error: this.error.bind(this)
		}
	}
}
