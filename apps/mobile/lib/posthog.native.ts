/**
 * PostHog's browser SDK touches DOM event APIs at module evaluation time.
 * Native / Expo Go builds intentionally use this no-op platform implementation.
 */
export function initPostHog(): void {}
