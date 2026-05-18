import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type HoursBadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-hours-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hours-badge tabular-nums',
    '[class.hours-badge--sm]': 'size() === "sm"',
    '[class.hours-badge--md]': 'size() === "md"',
    '[class.hours-badge--lg]': 'size() === "lg"',
    '[class.zero]': 'isZero()',
  },
  template: `
    {{ formattedHours() }}
    <span class="ml-1 font-normal opacity-70">h</span>
  `,
})
export class HoursBadgeComponent {
  readonly hours = input.required<number>();
  readonly size = input<HoursBadgeSize>('md');

  readonly isZero = computed(() => this.hours() === 0);
  readonly formattedHours = computed(() => this.hours().toFixed(1));
}
