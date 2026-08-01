/**
 * Lightweight haptic feedback via the Vibration API.
 * Works on Android; silently no-ops on iOS and desktop where the API is absent.
 */

/** Short tap — standard button press. */
export function hapticTap() {
  navigator.vibrate?.(12);
}

/** Medium pulse — confirming a choice or action. */
export function hapticConfirm() {
  navigator.vibrate?.([15, 40, 15]);
}

/** Soft double-tap — toggling something on/off. */
export function hapticToggle() {
  navigator.vibrate?.([8, 30, 8]);
}

/** Longer rumble — something important happened (unlock, transition). */
export function hapticImpact() {
  navigator.vibrate?.([20, 50, 30]);
}
