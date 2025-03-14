import { Badge, IBadgeProvider } from '@core/Emotes/BadgeProvider'
import { Logger } from '@core/Common/Logger'
import { REST } from '@core/Common/utils'

const logger = new Logger()
const { log, info, error } = logger.destruct()

export default class KickBadgeProvider implements IBadgeProvider {
	rootContext: RootContext
	channelData: ChannelData
	subscriberBadges: any[] = []
	subscriberBadgesLookupTable = new Map()
	highestBadgeCount = 1
	hasCustomBadges = false

	constructor(rootContext: RootContext, channelData: ChannelData) {
		this.rootContext = rootContext
		this.channelData = channelData
	}

	async initialize() {
		const { channelName } = this.channelData

		const channelInfo = await REST.get(`https://kick.com/api/v2/channels/${channelName}`)
		if (!channelInfo)
			return error(
				'KICK',
				'BADGE:PROV',
				'Unable to fetch channel info from Kick API for badge provider initialization.'
			)
		if (!channelInfo.subscriber_badges)
			return error(
				'KICK',
				'BADGE:PROV',
				'No subscriber badges found in channel info from Kick API for badge provider initialization.'
			)

		const subscriber_badges = channelInfo.subscriber_badges

		if (!subscriber_badges.length) return

		this.hasCustomBadges = true
		this.highestBadgeCount = subscriber_badges[subscriber_badges.length - 1].months || 1

		// Store the subscribe badge for each months count step for lookup table
		for (const subscriber_badge of subscriber_badges) {
			const badge = {
				html: `<img class="ntv__badge" src="${subscriber_badge?.badge_image.src}" srcset="${
					subscriber_badge?.badge_image.srcset
				}" alt="${subscriber_badge.months} months subscriber" ntv-tooltip="${
					subscriber_badge.months === 1
						? subscriber_badge.months + ' month subscriber'
						: subscriber_badge.months + ' months subscriber'
				}">`,
				months: subscriber_badge.months
			}
			this.subscriberBadges.push(badge)
		}

		// Index in lookup table for performance
		const thresholds = this.subscriberBadges.map(badge => badge.months)
		for (let i = 0; i < this.highestBadgeCount!; i++) {
			let j = 0
			while (i > thresholds[j] && j < 100) j++

			this.subscriberBadgesLookupTable.set(i, this.subscriberBadges[j])
		}
	}

	getBadge(badge: Badge) {
		if (badge.type === 'subscriber') {
			if (this.hasCustomBadges) {
				const subscriberBadge = this.subscriberBadgesLookupTable.get(badge.count || 0)
				if (subscriberBadge) return subscriberBadge.html
				else if (badge.count || 0 > this.highestBadgeCount) {
					const highestBadge = this.subscriberBadges[this.subscriberBadges.length - 1]
					return highestBadge.html
				}
			} else {
				return this.getGlobalBadge(badge)
			}
		}

		return this.getGlobalBadge(badge)
	}

	private getGlobalBadge(badge: Badge) {
		const randomId = '_' + ((Math.random() * 10000000) << 0)

		switch (badge.type) {
			case 'nipahtv':
				// return `<img class="ntv__badge" src="${RESOURCE_ROOT}assets/img/NTV_badge.svg" width="16" height="16" ntv-tooltip="NipahTV">`
				// return `<img class="ntv__badge" src="${RESOURCE_ROOT}assets/img/NTV_badge.png" width="16" height="16" ntv-tooltip="NipahTV">`
				// return `<svg class="ntv__badge" ntv-tooltip="NipahTV" width="16" height="16" viewBox="0 0 16 16" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"><path style="opacity:1;fill:#ff3e64;fill-opacity:1;fill-rule:nonzero;stroke-width:0.023423" d="M 0.0045448,15.994522 0.00653212,7.0100931 C 0.00268662,6.4657282 0.56985346,5.2666906 1.6344369,4.714763 2.2713742,4.3845464 2.837577,4.2734929 3.8954568,4.2515817 4.9164087,4.2304326 5.4269836,4.4338648 5.61042,4.5236104 6.1140039,4.7499277 6.6375815,5.2244865 6.7816227,5.4288944 l 4.5552313,6.6637346 c 0.270458,0.343536 0.601629,0.565661 0.949354,0.529787 0.293913,-0.02339 0.449771,-0.268141 0.45106,-0.491161 l 0.0031,-9.2329087 -12.73699293,6.478e-4 4.453e-5,-2.8976667 15.9946434,2.145e-4 -1.11e-4,13.0844041 c -0.0057,0.149032 -0.09913,1.190976 -1.067016,2.026055 -0.866438,0.807769 -2.342194,0.87905 -2.342194,0.87905 -0.620946,0.0088 -1.091187,0.02361 -1.441943,-0.04695 -0.581657,-0.148437 -0.833883,-0.27401 -1.315459,-0.607888 -0.4222398,-0.311805 -0.7037358,-0.678791 -0.9410734,-0.987827 0,0 -1.1204546,-1.801726 -1.931821,-2.982711 C 6.3363366,10.413177 5.2823578,8.9426183 4.7672147,8.2745095 4.375011,7.7288473 4.102008,7.6101039 3.9558506,7.5598495 3.7999133,7.5101456 3.6283732,7.55479 3.4962961,7.6097361 3.3794655,7.6629412 3.2800176,7.7609522 3.2623448,7.8936439 l 7.879e-4,8.1018591 z"/></svg>`
				return `<svg class="ntv__badge" ntv-tooltip="NipahTV" width="16" height="16" viewBox="0 0 16 16" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"><path style="opacity:1;fill:#ff3e64;fill-opacity:1;fill-rule:nonzero;stroke-width:0.0213617" d="m 0.70822498,15.290987 0.001812,-7.8292114 C 0.70653032,6.965316 1.2237852,5.8717964 2.194683,5.3684396 2.7755683,5.0672828 3.2919441,4.9660023 4.2567281,4.9460193 5.1878339,4.9267313 5.6534771,5.112261 5.8207707,5.1941088 6.2800381,5.4005097 6.7575397,5.8333063 6.888905,6.0197258 l 4.116172,5.7127422 c 0.246656,0.313304 0.472304,0.515883 0.789429,0.483165 0.268048,-0.02132 0.391095,-0.244543 0.39227,-0.447937 l 0.0028,-8.1313972 -11.48244477,5.907e-4 4.061e-5,-2.93166096 14.58710216,1.9564e-4 -1.02e-4,11.93294882 c -0.0053,0.135916 -0.09041,1.086166 -0.973117,1.847756 -0.790189,0.736683 -2.136076,0.801691 -2.136076,0.801691 -0.566301,0.0081 -0.99516,0.02153 -1.315048,-0.04282 -0.53047,-0.135372 -0.7605,-0.249894 -1.1996957,-0.554391 -0.3850818,-0.284365 -0.6418055,-0.56177 -0.8582569,-0.84361 0,0 -1.0218521,-1.278603 -1.7618165,-2.355658 C 6.4828049,10.622664 5.5215787,9.3197084 5.0517693,8.7103949 4.6940804,8.212752 4.4451023,8.1044584 4.311807,8.0586264 4.1695927,8.0132966 4.0131483,8.0540122 3.8926944,8.1041229 3.7861451,8.1526458 3.6954488,8.2420316 3.6793314,8.3630461 l 7.185e-4,6.9288349 z"/></svg>`

			case 'broadcaster':
				return `<svg class="ntv__badge" ntv-tooltip="Broadcaster" x="0px" y="0px" width="16" height="16" viewBox="0 0 16 16" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><g id="Badge_Chat_host"><linearGradient id="badge-host-gradient-1${randomId}" gradientUnits="userSpaceOnUse" x1="4" y1="180.5864" x2="4" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><rect x="3.2" y="9.6" style="fill:url(#badge-host-gradient-1${randomId});" width="1.6" height="1.6"></rect><linearGradient id="badge-host-gradient-2${randomId}" gradientUnits="userSpaceOnUse" x1="8" y1="180.5864" x2="8" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><polygon style="fill:url(#badge-host-gradient-2${randomId});" points="6.4,9.6 9.6,9.6 9.6,8 11.2,8 11.2,1.6 9.6,1.6 9.6,0 6.4,0 6.4,1.6 4.8,1.6 4.8,8 6.4,8"></polygon><linearGradient id="badge-host-gradient-3${randomId}" gradientUnits="userSpaceOnUse" x1="2.4" y1="180.5864" x2="2.4" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><rect x="1.6" y="6.4" style="fill:url(#badge-host-gradient-3${randomId});" width="1.6" height="3.2"></rect><linearGradient id="badge-host-gradient-4${randomId}" gradientUnits="userSpaceOnUse" x1="12" y1="180.5864" x2="12" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><rect x="11.2" y="9.6" style="fill:url(#badge-host-gradient-4${randomId});" width="1.6" height="1.6"></rect><linearGradient id="badge-host-gradient-5${randomId}" gradientUnits="userSpaceOnUse" x1="8" y1="180.5864" x2="8" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><polygon style="fill:url(#badge-host-gradient-5${randomId});" points="4.8,12.8 6.4,12.8 6.4,14.4 4.8,14.4 4.8,16 11.2,16 11.2,14.4 9.6,14.4 9.6,12.8 11.2,12.8 11.2,11.2 4.8,11.2 	"></polygon><linearGradient gradientUnits="userSpaceOnUse" x1="13.6" y1="180.5864" x2="13.6" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)" id="badge-host-gradient-6${randomId}"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><rect x="12.8" y="6.4" style="fill:url(#badge-host-gradient-6${randomId});" width="1.6" height="3.2"></rect></g></svg>`

			case 'verified':
				return `<svg class="ntv__badge" ntv-tooltip="Verified" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<defs><linearGradient id="badge-verified-gradient${randomId}" x1="25.333%" y1="99.375%" x2="73.541%" y2="2.917%" gradientUnits="objectBoundingBox"><stop stop-color="#1EFF00"/><stop offset="0.99" stop-color="#00FF8C"/></linearGradient></defs><path d="M14.72 7.00003V6.01336H15.64V4.12003H14.6733V3.16003H9.97332V1.2667H8.96665V0.280029H7.03332V1.2667H6.03332V3.16003H1.32665V4.12003H0.359985V6.01336H1.28665V7.00003H2.23332V9.0067H1.28665V9.99336H0.359985V11.8867H1.32665V12.8467H6.03332V14.74H7.03332V15.7267H8.96665V14.74H9.97332V12.8467H14.6733V11.8867H15.64V9.99336H14.72V9.0067H13.7733V7.00003H14.72ZM12.5 6.59336H11.44V7.66003H10.3733V8.72003H9.31332V9.7867H8.24665V10.8467L7.09332 10.9V11.8H6.02665V10.8467H5.05999V9.7867H3.99332V7.66003H6.11999V8.72003H7.18665V7.66003H8.24665V6.59336H9.31332V5.53336H10.3733V4.4667H12.5V6.59336Z" fill="url(#badge-verified-gradient${randomId})"/></svg>`

			case 'staff':
				return `<svg class="ntv__badge" ntv-tooltip="Staff" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="badge-verified-gradient${randomId}" x1="33.791%" y1="97.416%" x2="65.541%" y2="4.5%" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="#1EFF00"></stop><stop offset="0.99" stop-color="#00FF8C"></stop></linearGradient></defs><path fill-rule="evenodd" clip-rule="evenodd" d="M2.07324 1.33331H6.51991V4.29331H7.99991V2.81331H9.47991V1.33331H13.9266V5.77998H12.4466V7.25998H10.9599V8.73998H12.4466V10.22H13.9266V14.6666H9.47991V13.1866H7.99991V11.7066H6.51991V14.6666H2.07324V1.33331Z" fill="url(#badge-verified-gradient${randomId})"></path></svg>`

			case 'global_moderator':
				return `<svg class="ntv__badge" ntv-tooltip="Global Moderator" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" xml:space="preserve" width="16" height="16" style="enable-background:new 0 0 16 16"><g><linearGradient id="badge-global-mod-gradient${randomId}" gradientUnits="userSpaceOnUse" x1="-1.918" y1="382.5619" x2="17.782" y2="361.3552" gradientTransform="matrix(1 0 0 1 0 -364)"><stop offset="0" style="stop-color:#FCA800"></stop><stop offset="0.99" style="stop-color:#FF5100"></stop></linearGradient><path style="fill:url(#badge-global-mod-gradient${randomId})" d="M10.5,0v1.5H9V3H7.5v1.5h-6v6H0V16h5.5v-1.5h6v-6H13V7h1.5V5.5H16V0H10.5z M14.7,4.3h-1.5 v1.5h-1.5v1.5h-1.5v1.5H8.7v1.5h1.5v3h-3v-1.5H5.8v1.5H4.3v1.5h-3v-3h1.5v-1.5h1.5V8.7H2.8v-3h3v1.5h1.5V5.8h1.5V4.3h1.5V2.8h1.5 V1.3h3v3H14.7z"></path></g></svg>`

			case 'global_admin':
				return `<svg class="ntv__badge" ntv-tooltip="Global Admin" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" xml:space="preserve" width="16" height="16" style="enable-background:new 0 0 16 16"><linearGradient id="badge-global-staff-gradient${randomId}" gradientUnits="userSpaceOnUse" x1="-0.03948053" y1="-180.1338" x2="15.9672" y2="-163.9405" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#FCA800"></stop><stop offset="0.99" style="stop-color:#FF5100"></stop></linearGradient><path style="fill-rule:evenodd;clip-rule:evenodd;fill:url(#badge-global-staff-gradient${randomId});" d="M1.1,0.3v15.3H15V0.3H1.1z M12.9,6.2h-1.2v1.2h-1.2v1.2h1.2v1.2h1.2v3.7H9.2v-1.2H8V11H6.8v2.4H3.1v-11h3.7v2.4H8V3.7h1.2V2.5h3.7V6.2z"></path></svg>`

			case 'sidekick':
				return `<svg class="ntv__badge" ntv-tooltip="Sidekick" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" xml:space="preserve" width="16" height="16" style="enable-background:new 0 0 16 16"><linearGradient id="badge-sidekick-gradient${randomId}" gradientUnits="userSpaceOnUse" x1="9.3961" y1="-162.6272" x2="5.8428" y2="-180.3738" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#FF6A4A;"></stop><stop offset="1" style="stop-color:#C70C00;"></stop></linearGradient><path style="fill:url(#badge-sidekick-gradient${randomId});" d="M0,2.8v5.6h1.1V10h1.1v1.6h1.1v1.6h3.4v-1.6H9v1.6h3.4v-1.6h1.1V10h1.1V8.4H16V2.8h-4.6v1.6H9.1V6H6.8V4.4H4.5V2.8H0z M6.9,9.6H3.4V8H2.3V4.8h1.1v1.6h2.3V8h1.1v1.6H6.9z M13.7,8h-1.1v1.6H9.2V8h1.1V6.4h2.3V4.8h1.1C13.7,4.8,13.7,8,13.7,8z"></path></svg>`

			case 'moderator':
				return `<svg class="ntv__badge" ntv-tooltip="Moderator" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" xml:space="preserve" width="16" height="16" style="enable-background:new 0 0 16 16"><path style="fill: rgb(0, 199, 255);" d="M11.7,1.3v1.5h-1.5v1.5 H8.7v1.5H7.3v1.5H5.8V5.8h-3v3h1.5v1.5H2.8v1.5H1.3v3h3v-1.5h1.5v-1.5h1.5v1.5h3v-3H8.7V8.7h1.5V7.3h1.5V5.8h1.5V4.3h1.5v-3C14.7,1.3,11.7,1.3,11.7,1.3z"></path></svg>`

			case 'vip':
				return `<svg class="ntv__badge" ntv-tooltip="VIP" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" xml:space="preserve" width="16" height="16"><linearGradient id="badge-vip-gradient${randomId}" gradientUnits="userSpaceOnUse" x1="8" y1="-163.4867" x2="8" y2="-181.56" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color: rgb(255, 201, 0);"></stop><stop offset="0.99" style="stop-color: rgb(255, 149, 0);"></stop></linearGradient><path d="M13.9,2.4v1.1h-1.2v2.3 h-1.1v1.1h-1.1V4.6H9.3V1.3H6.7v3.3H5.6v2.3H4.4V5.8H3.3V3.5H2.1V2.4H0v12.3h16V2.4H13.9z" style="fill: url(#badge-vip-gradient${randomId});"></path></svg>`

			case 'og':
				return `<svg class="ntv__badge" ntv-tooltip="OG" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" xml:space="preserve" width="16" height="16"><g><linearGradient id="badge-og-gradient-1${randomId}" gradientUnits="userSpaceOnUse" x1="12.2" y1="-180" x2="12.2" y2="-165.2556" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#00FFF2;"></stop><stop offset="0.99" style="stop-color:#006399;"></stop></linearGradient><path style="fill:url(#badge-og-gradient-1${randomId});" d="M16,16H9.2v-0.8H8.4v-8h0.8V6.4H16v3.2h-4.5v4.8H13v-1.6h-0.8v-1.6H16V16z"></path><linearGradient id="badge-og-gradient-2${randomId}" gradientUnits="userSpaceOnUse" x1="3.7636" y1="-164.265" x2="4.0623" y2="-179.9352" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#00FFF2;"></stop><stop offset="0.99" style="stop-color:#006399;"></stop></linearGradient><path style="fill:url(#badge-og-gradient-2${randomId});" d="M6.8,8.8v0.8h-6V8.8H0v-8h0.8V0h6.1v0.8 h0.8v8H6.8z M4.5,6.4V1.6H3v4.8H4.5z"></path><path style="fill:#00FFF2;" d="M6.8,15.2V16h-6v-0.8H0V8.8h0.8V8h6.1v0.8h0.8v6.4C7.7,15.2,6.8,15.2,6.8,15.2z M4.5,14.4V9.6H3v4.8 C3,14.4,4.5,14.4,4.5,14.4z"></path><path style="fill:#00FFF2;" d="M16,8H9.2V7.2H8.4V0.8h0.8V0H16v1.6h-4.5v4.8H13V4.8h-0.8V3.2H16V8z"></path></g></svg>`

			case 'founder':
				return `<svg class="ntv__badge" ntv-tooltip="Founder" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" xml:space="preserve" width="16" height="16"><linearGradient id="badge-founder-gradient${randomId}" gradientUnits="userSpaceOnUse" x1="7.874" y1="20.2333" x2="8.1274" y2="-0.3467" gradientTransform="matrix(1 0 0 -1 0 18)"><stop offset="0" style="stop-color: rgb(255, 201, 0);"></stop><stop offset="0.99" style="stop-color: rgb(255, 149, 0);"></stop></linearGradient><path d="M14.6,4V2.7h-1.3V1.4H12V0H4v1.4H2.7v1.3H1.3V4H0v8h1.3v1.3h1.4v1.3H4V16h8v-1.4h1.3v-1.3h1.3V12H16V4H14.6z M9.9,12.9H6.7V6.4H4.5 V5.2h1V4.1h1v-1h3.4V12.9z" style="fill-rule: evenodd; clip-rule: evenodd; fill: url(#badge-founder-gradient${randomId});"></path></svg>`

			case 'subscriber':
				return `<svg class="ntv__badge" ntv-tooltip="${
					badge.count
						? badge.count === 1
							? badge.count + ' month subscriber'
							: badge.count + ' months subscriber'
						: ''
				} months" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" xml:space="preserve" width="16" height="16"><g><linearGradient id="badge-subscriber-gradient-1${randomId}" gradientUnits="userSpaceOnUse" x1="-2.386" y1="-151.2764" x2="42.2073" y2="-240.4697" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#E1FF00;"></stop><stop offset="0.99" style="stop-color:#2AA300;"></stop></linearGradient><path style="fill:url(#badge-subscriber-gradient-1${randomId});" d="M14.8,7.3V6.1h-2.4V4.9H11V3.7H9.9V1.2H8.7V0H7.3v1.2H6.1v2.5H5v1.2H3.7v1.3H1.2v1.2H0v1.4
				h1.2V10h2.4v1.3H5v1.2h1.2V15h1.2v1h1.3v-1.2h1.2v-2.5H11v-1.2h1.3V9.9h2.4V8.7H16V7.3H14.8z"></path><linearGradient id="badge-subscriber-gradient-2${randomId}" gradientUnits="userSpaceOnUse" x1="-5.3836" y1="-158.3055" x2="14.9276" y2="-189.0962" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#E1FF00;"></stop><stop offset="0.99" style="stop-color:#2AA300;"></stop></linearGradient><path style="fill:url(#badge-subscriber-gradient-2${randomId});" d="M7.3,7.3v7.5H6.1v-2.5H5v-1.2H3.7V9.9H1.2
				V8.7H0V7.3H7.3z"></path><linearGradient id="badge-subscriber-gradient-3${randomId}" gradientUnits="userSpaceOnUse" x1="3.65" y1="-160.7004" x2="3.65" y2="-184.1244" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#E1FF00;"></stop><stop offset="0.99" style="stop-color:#2AA300;"></stop></linearGradient><path style="fill:url(#badge-subscriber-gradient-3${randomId});" d="M7.3,7.3v7.5H6.1v-2.5H5v-1.2H3.7V9.9H1.2
				V8.7H0V7.3H7.3z"></path><linearGradient id="badge-subscriber-gradient-4${randomId}" gradientUnits="userSpaceOnUse" x1="22.9659" y1="-167.65" x2="-5.3142" y2="-167.65" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#E1FF00;"></stop><stop offset="0.99" style="stop-color:#2AA300;"></stop></linearGradient><path style="fill:url(#badge-subscriber-gradient-4${randomId});" d="M8.7,0v7.3H1.2V6.1h2.4V4.9H5V3.7h1.2V1.2
				h1.2V0H8.7z"></path><linearGradient id="badge-subscriber-gradient-5${randomId}" gradientUnits="userSpaceOnUse" x1="12.35" y1="-187.6089" x2="12.35" y2="-161.5965" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#E1FF00;"></stop><stop offset="0.99" style="stop-color:#2AA300;"></stop></linearGradient><path style="fill:url(#badge-subscriber-gradient-5${randomId});" d="M8.7,8.7V1.2h1.2v2.5H11v1.2h1.3v1.3h2.4
				v1.2H16v1.4L8.7,8.7L8.7,8.7z"></path><linearGradient id="badge-subscriber-gradient-6${randomId}" gradientUnits="userSpaceOnUse" x1="-6.5494" y1="-176.35" x2="21.3285" y2="-176.35" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#E1FF00;"></stop><stop offset="0.99" style="stop-color:#2AA300;"></stop></linearGradient><path style="fill:url(#badge-subscriber-gradient-6${randomId});" d="M7.3,16V8.7h7.4v1.2h-2.4v1.3H11v1.2H9.9
				v2.5H8.7V16H7.3z"></path><linearGradient id="badge-subscriber-gradient-7${randomId}" gradientUnits="userSpaceOnUse" x1="6.72" y1="-169.44" x2="12.2267" y2="-180.4533" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#E1FF00;"></stop><stop offset="0.99" style="stop-color:#2AA300;"></stop></linearGradient><path style="fill:url(#badge-subscriber-gradient-7${randomId});" d="M8.7,7.3H7.3v1.4h1.3L8.7,7.3L8.7,7.3z"></path></g></svg>`

			case 'sub_gifter':
				const count = badge.count || 1
				if (count < 25) {
					// Blue badge -> 21
					return `<svg class="ntv__badge" ntv-tooltip="Gifted ${badge.count} subs" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_301_17810)"><path d="M7.99999 9.14999V6.62499L0.484985 3.35999V6.34499L1.15499 6.63499V12.73L7.99999 15.995V9.14999Z" fill="#0269D4"></path><path d="M8.00003 10.735V9.61501L1.15503 6.63501V7.70501L8.00003 10.735Z" fill="#0269D4"></path><path d="M15.515 3.355V6.345L14.85 6.64V12.73L12.705 13.755L11.185 14.48L8.00499 15.995V6.715L4.81999 5.295H4.81499L3.29499 4.61L0.484985 3.355L3.66999 1.935L3.67999 1.93L5.09499 1.3L8.00499 0L10.905 1.3L12.32 1.925L12.33 1.935L15.515 3.355Z" fill="#04D0FF"></path><path d="M14.845 6.63501V7.70501L8 10.735V9.61501L14.845 6.63501Z" fill="#0269D4"></path></g><defs><clipPath id="clip0_301_17810"><rect width="16" height="16" fill="white"></rect></clipPath></defs></svg>`
				} else if (count >= 25) {
					//  Purple badge -> 29 / 46
					return `<svg class="ntv__badge" ntv-tooltip="Gifted ${badge.count} subs" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_301_17815)"><path d="M8.02501 9.14999V6.62499L0.51001 3.35999V6.34499L1.17501 6.63499V12.73L8.02501 15.995V9.14999Z" fill="#7B1BAB"></path><path d="M8.02505 10.735V9.61501L1.17505 6.63501V7.70501L8.02505 10.735Z" fill="#7B1BAB"></path><path d="M15.535 3.355V6.345L14.87 6.64V12.73L12.725 13.755L11.21 14.48L8.02501 15.995V6.715L4.84001 5.295H4.83501L3.32001 4.61L0.51001 3.355L3.69001 1.935L3.70501 1.93L5.11501 1.3L8.02501 0L10.93 1.3L12.34 1.925L12.355 1.935L15.535 3.355Z" fill="#A947D3"></path><path d="M14.87 6.63501V7.70501L8.02502 10.735V9.61501L14.87 6.63501Z" fill="#7B1BAB"></path></g><defs><clipPath id="clip0_301_17815"><rect width="16" height="16" fill="white"></rect></clipPath></defs></svg>`
				} else if (count >= 50) {
					// Pink badge -> 53 / 82
					return `<svg class="ntv__badge" ntv-tooltip="Gifted ${badge.count} subs" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_301_17820)"><path d="M7.99999 9.14999V6.62499L0.484985 3.35999V6.34499L1.14999 6.63999V12.73L7.99999 16V9.14999Z" fill="#CF0038"></path><path d="M8.00002 10.74V9.61501L1.15002 6.64001V7.71001L8.00002 10.74Z" fill="#CF0038"></path><path d="M15.515 3.355V6.345L14.85 6.64V12.73L12.705 13.755L11.185 14.48L8.00499 15.995V6.715L4.81999 5.295H4.81499L3.29499 4.61L0.484985 3.355L3.66999 1.935L3.67999 1.93L5.09499 1.3L8.00499 0L10.905 1.3L12.32 1.925L12.33 1.935L15.515 3.355Z" fill="#FA4E78"></path><path d="M14.85 6.64001V7.71001L8 10.74V9.61501L14.85 6.64001Z" fill="#CF0038"></path></g><defs><clipPath id="clip0_301_17820"><rect width="16" height="16" fill="white"></rect></clipPath></defs></svg>`
				} else if (count >= 100) {
					// Yellow badge -> 130 / 163
					return `<svg class="ntv__badge" ntv-tooltip="Gifted ${badge.count} subs" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_301_17825)"><path d="M7.99999 9.14999V6.62499L0.484985 3.35999V6.34499L1.14999 6.63999V12.73L7.99999 16V9.14999Z" fill="#FF5008"></path><path d="M8.00002 10.74V9.61501L1.15002 6.64001V7.71001L8.00002 10.74Z" fill="#FF5008"></path><path d="M15.515 3.355V6.345L14.85 6.64V12.73L12.705 13.755L11.185 14.48L8.00499 15.995V6.715L4.81999 5.295H4.81499L3.29499 4.61L0.484985 3.355L3.66999 1.935L3.67999 1.93L5.09499 1.3L8.00499 0L10.905 1.3L12.32 1.925L12.33 1.935L15.515 3.355Z" fill="#FFC800"></path><path d="M14.85 6.64001V7.71001L8 10.74V9.61501L14.85 6.64001Z" fill="#FF5008"></path></g><defs><clipPath id="clip0_301_17825"><rect width="16" height="16" fill="white"></rect></clipPath></defs></svg>`
				} else if (count >= 200) {
					// Green badge -> 615
					return `<svg class="ntv__badge" ntv-tooltip="Gifted ${badge.count} subs" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_301_17830)"><path d="M7.99999 9.14999V6.62499L0.484985 3.35999V6.34499L1.14999 6.63999V12.73L7.99999 16V9.14999Z" fill="#2FA604"></path><path d="M8.00002 10.74V9.61501L1.15002 6.64001V7.71001L8.00002 10.74Z" fill="#2FA604"></path><path d="M15.515 3.355V6.345L14.85 6.64V12.73L12.705 13.755L11.185 14.48L8.00499 15.995V6.715L4.81999 5.295H4.81499L3.29499 4.61L0.484985 3.355L3.66999 1.935L3.67999 1.93L5.09499 1.3L8.00499 0L10.905 1.3L12.32 1.925L12.33 1.935L15.515 3.355Z" fill="#53F918"></path><path d="M14.85 6.64001V7.71001L8 10.74V9.61501L14.85 6.64001Z" fill="#2FA604"></path></g><defs><clipPath id="clip0_301_17830"><rect width="16" height="16" fill="white"></rect></clipPath></defs></svg>`
				}
		}
	}
}
