/**
 * Type-safe event listener and dispatch signatures for the custom events
 * defined in `TDetails`.
 */
export interface CustomEventTarget<TDetails> {
	addEventListener<TType extends keyof TDetails>(
		type: TType,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		listener: (ev: CustomEvent<TDetails[TType]>) => any,
		options?: boolean | AddEventListenerOptions
	): void

	removeEventListener<TType extends keyof TDetails>(
		type: TType,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		listener: (ev: CustomEvent<TDetails[TType]>) => any,
		options?: boolean | EventListenerOptions
	): void

	dispatchEvent<TType extends keyof TDetails>(ev: _TypedCustomEvent<TDetails, TType>): void
}

/**
 * Extends an element type with type-safe event listener signatures for the
 * custom events defined in `TDetails`.
 */
export type CustomEventElement<TDetails, TElement = HTMLElement> = CustomEventTarget<TDetails> & TElement

/**
 * Internal declaration for the `typeof` trick below.
 * Never actually implemented.
 */
declare class _TypedCustomEvent<TDetails, TType extends keyof TDetails> extends CustomEvent<TDetails[TType]> {
	constructor(type: TType, eventInitDict: { detail: TDetails[TType] } & EventInit)
}

/**
 * Typed custom event (technically a typed alias of `CustomEvent`).
 * Use with `CustomEventTarget.dispatchEvent` to infer `detail` types
 * automatically.
 */
export const TypedCustomEvent = CustomEvent as typeof _TypedCustomEvent
