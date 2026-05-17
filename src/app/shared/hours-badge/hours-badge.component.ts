import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type HoursBadgeSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<HoursBadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-4 py-1.5 text-lg',
};

@Component({
  selector: 'app-hours-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
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
  readonly hostClasses = computed(() => {
    const classes = ['hours-badge', 'tabular-nums', SIZE_CLASSES[this.size()]];

    if (this.isZero()) {
      classes.push('zero');
    }

    return classes.join(' ');
  });
}
