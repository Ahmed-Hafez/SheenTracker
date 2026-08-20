import { signal, effect, untracked, DestroyRef, Signal } from '@angular/core';

export function animatedValue(
  target: Signal<number>,
  destroyRef: DestroyRef,
  duration = 800,
): Signal<number> {
  const display = signal(0);
  let rafId: number | null = null;

  effect((onCleanup) => {
    const end = target();
    const start = untracked(display); // read without subscribing

    if (start === end) return;

    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (startTimestamp === null) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      display.set(Math.round(progress * (end - start) + start));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);

    // Cancels the in-flight frame if `target` changes again before this
    // animation finishes, or when the effect itself is torn down.
    onCleanup(() => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    });
  });

  destroyRef.onDestroy(() => {
    if (rafId !== null) cancelAnimationFrame(rafId);
  });

  return display.asReadonly();
}
