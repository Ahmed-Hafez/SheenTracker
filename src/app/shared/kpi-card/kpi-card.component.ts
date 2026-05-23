import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'kpi-card',
  },
  template: `
    <div class="flex items-start justify-between gap-4 w-full">
      <div class="min-w-0 space-y-1.5">
        <p class="kpi-label uppercase text-(--charcoal-600)">{{ label() }}</p>
        <p class="kpi-value tabular-nums">{{ roundedValue() }}</p>
        @if (hint()) {
          <p class="small text-(--charcoal-600)">{{ hint() }}</p>
        }
      </div>
      <div class="kpi-icon" aria-hidden="true">
        <i [class]="icon()"></i>
      </div>
    </div>
  `,
  
})
export class KpiCardComponent {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input<string | null>(null);

  roundedValue() {
    if (typeof this.value() === 'number') {
      return this.value().toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    return this.value();
  }
}
