import { Directive, ElementRef, input, effect, untracked, DestroyRef, inject } from '@angular/core';

@Directive({
  selector: '[appAnimateNumber]',
  standalone: true,
})
export class AnimateNumberDirective {
  /** The target numeric value to animate toward. */
  readonly appAnimateNumber = input.required<number>();

  /** Animation holds at 0 until this is true (e.g. !isLoading() && !isError()). */
  readonly ready = input<boolean>(true);

  readonly suffix = input<string>('');
  readonly duration = input<number>(800);

  private readonly el = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  private current = 0;
  private rafId: number | null = null;

  constructor() {
    effect((onCleanup) => {
      const isReady = this.ready();
      const target = Math.round(isReady ? this.appAnimateNumber() : 0);
      const start = untracked(() => this.current);
      const suffix = this.suffix();

      if (start === target) {
        this.el.textContent = `${target}${suffix}`;
        return;
      }

      let startTimestamp: number | null = null;
      const duration = this.duration();

      const step = (timestamp: number) => {
        if (startTimestamp === null) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        this.current = Math.round(progress * (target - start) + start);
        this.el.textContent = `${this.current}${suffix}`;
        if (progress < 1) {
          this.rafId = requestAnimationFrame(step);
        }
      };

      this.rafId = requestAnimationFrame(step);

      onCleanup(() => {
        if (this.rafId !== null) cancelAnimationFrame(this.rafId);
      });
    });

    this.destroyRef.onDestroy(() => {
      if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    });
  }
}
