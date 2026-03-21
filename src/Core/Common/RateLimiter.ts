type QueuedTask = {
	task: () => Promise<unknown> | unknown
	resolve: (value: unknown) => void
	reject: (reason?: any) => void
}

export type RateLimiterState = {
	isCoolingDown: boolean
	queueSize: number
	maxExecutions: number
	windowMs: number
	cooldownStartedAt: number | null
	cooldownEndsAt: number | null
	cooldownDurationMs: number
	remainingMs: number
}

type RateLimiterListener = (state: RateLimiterState) => void

export default class RateLimiter {
	private readonly queue: QueuedTask[] = []
	private readonly listeners = new Set<RateLimiterListener>()
	private cooldownTimeout: ReturnType<typeof setTimeout> | null = null
	private cooldownStartedAt: number | null = null
	private cooldownEndsAt: number | null = null
	private windowStartedAt: number | null = null
	private executionsInWindow = 0
	private isProcessingQueue = false

	constructor(
		private readonly maxExecutions: number,
		private readonly windowMs: number
	) {
		if (maxExecutions < 1) throw new Error('maxExecutions must be at least 1.')
		if (windowMs < 1) throw new Error('windowMs must be at least 1.')
	}

	schedule<T>(task: () => Promise<T> | T): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			this.queue.push({
				task: () => task(),
				resolve: value => resolve(value as T | PromiseLike<T>),
				reject
			})
			this.emitState()
			this.processQueue()
		})
	}

	subscribe(listener: RateLimiterListener, emitInitialState = true) {
		this.listeners.add(listener)

		if (emitInitialState) {
			listener(this.getState())
		}

		return () => {
			this.listeners.delete(listener)
		}
	}

	getState(now = Date.now()): RateLimiterState {
		const remainingMs = this.cooldownEndsAt ? Math.max(this.cooldownEndsAt - now, 0) : 0

		return {
			isCoolingDown: remainingMs > 0,
			queueSize: this.queue.length,
			maxExecutions: this.maxExecutions,
			windowMs: this.windowMs,
			cooldownStartedAt: this.cooldownStartedAt,
			cooldownEndsAt: this.cooldownEndsAt,
			cooldownDurationMs:
				this.cooldownStartedAt && this.cooldownEndsAt ? this.cooldownEndsAt - this.cooldownStartedAt : 0,
			remainingMs
		}
	}

	private async processQueue() {
		if (this.isProcessingQueue) return

		this.isProcessingQueue = true

		try {
			if (this.cooldownTimeout) {
				clearTimeout(this.cooldownTimeout)
				this.cooldownTimeout = null
			}

			while (this.queue.length) {
				const now = Date.now()
				this.refreshWindow(now)

				if (this.executionsInWindow >= this.maxExecutions) {
					const cooldownStartedAt = this.windowStartedAt ?? now
					const cooldownEndsAt = cooldownStartedAt + this.windowMs
					const waitMs = Math.max(cooldownEndsAt - now, 0)

					this.setCooldownState(cooldownStartedAt, cooldownEndsAt)

					this.emitState(now)

					this.cooldownTimeout = setTimeout(() => {
						this.cooldownTimeout = null
						this.processQueue()
					}, waitMs)

					return
				}

				this.clearCooldownState()

				const queuedTask = this.queue.shift()
				if (!queuedTask) return

				// Helps message brusts to be processed in the right order on server side
				await new Promise(resolve => setTimeout(resolve, 100))

				if (this.executionsInWindow === 0 || this.windowStartedAt === null) {
					this.windowStartedAt = now
				}

				this.executionsInWindow++
				this.emitState(now)

				try {
					Promise.resolve(queuedTask.task()).then(queuedTask.resolve, queuedTask.reject)
				} catch (error) {
					queuedTask.reject(error)
				}
			}

			this.clearCooldownState()
			this.emitState()
		} finally {
			this.isProcessingQueue = false
		}
	}

	private refreshWindow(now: number) {
		if (this.windowStartedAt === null) return
		if (now < this.windowStartedAt + this.windowMs) return

		this.windowStartedAt = null
		this.executionsInWindow = 0
	}

	private clearCooldownState() {
		this.cooldownStartedAt = null
		this.cooldownEndsAt = null
	}

	private setCooldownState(startedAt: number, endsAt: number) {
		this.cooldownStartedAt = startedAt
		this.cooldownEndsAt = endsAt
	}

	private emitState(now = Date.now()) {
		const state = this.getState(now)

		for (const listener of this.listeners) {
			listener(state)
		}
	}
}
