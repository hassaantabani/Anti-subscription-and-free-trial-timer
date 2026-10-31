import confetti from 'canvas-confetti';

/**
 * Small happy animation when a user removes or cancels a subscription
 * Emphasizes money saved and relief!
 */
export function triggerHappyCancellationConfetti() {
  // Burst from center-left & center-right
  confetti({
    particleCount: 65,
    spread: 60,
    origin: { y: 0.65 },
    colors: ['#10B981', '#34D399', '#059669', '#6EE7B7', '#FBBF24'],
    disableForReducedMotion: true,
  });
}

/**
 * Congratulations animation when a new subscription is added
 * Celebrates that the timer/shield is now actively monitoring and protecting the user!
 */
export function triggerCongratulationsConfetti() {
  const duration = 1.2 * 1000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#6366F1', '#EC4899', '#3B82F6', '#F59E0B', '#10B981'],
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#6366F1', '#EC4899', '#3B82F6', '#F59E0B', '#10B981'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}
