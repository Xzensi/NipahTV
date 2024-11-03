import { SevenTV } from '.'

type ColorStop = { color: number; at: number }
type Shadow = { color: number; x_offset: number; y_offset: number; radius: number }

export default class SevenTVPaintStyleGenerator {
	private static convertColorToHex(color: number): string {
		return `#${(color >>> 0).toString(16).padStart(8, '0')}`
	}

	private static createColorStop(stop: ColorStop): string {
		const color = SevenTVPaintStyleGenerator.convertColorToHex(stop.color)
		return `${color} ${stop.at * 100}%`
	}

	private static createLinearGradient(paint: SevenTV.CosmeticPaint): string {
		if (!paint.stops?.length) return ''

		const gradientStops = paint.stops.map(SevenTVPaintStyleGenerator.createColorStop)
		const prefix = paint.repeat ? 'repeating-' : ''
		return `background-image: ${prefix}linear-gradient(${paint.angle}deg, ${gradientStops.join(', ')});`
	}

	private static createRadialGradient(paint: SevenTV.CosmeticPaint): string {
		if (!paint.stops?.length) return ''

		const gradientStops = paint.stops.map(SevenTVPaintStyleGenerator.createColorStop)
		const prefix = paint.repeat ? 'repeating-' : ''
		return `background-image: ${prefix}radial-gradient(circle, ${gradientStops.join(
			', '
		)});\nbackground-size: 100% auto;`
	}

	private static createImageBackground(imageUrl: string): string {
		return `background-image: url('${imageUrl}');\nbackground-size: 100% auto;`
	}

	private static createShadowEffects(shadows: Shadow[]): string {
		if (!shadows?.length) return "filter: '';"

		const dropShadows = shadows.map(shadow => {
			const color = SevenTVPaintStyleGenerator.convertColorToHex(shadow.color)
			return `drop-shadow(${color} ${shadow.x_offset}px ${shadow.y_offset}px ${shadow.radius}px)`
		})
		return `filter: ${dropShadows.join(' ')};`
	}

	static generateCSSRules(paint: SevenTV.CosmeticPaint, shadows: boolean): string {
		const rules: string[] = []

		switch (paint.function) {
			case 'LINEAR_GRADIENT':
				rules.push(SevenTVPaintStyleGenerator.createLinearGradient(paint))
				break
			case 'RADIAL_GRADIENT':
				rules.push(SevenTVPaintStyleGenerator.createRadialGradient(paint))
				break
			case 'URL':
				rules.push(SevenTVPaintStyleGenerator.createImageBackground(paint.image_url!))
				break
		}

		if (shadows) rules.push(SevenTVPaintStyleGenerator.createShadowEffects(paint.shadows ?? []))

		return rules.filter(Boolean).join('')
	}
}
