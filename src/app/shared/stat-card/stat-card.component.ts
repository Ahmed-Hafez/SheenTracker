import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';

export type StatCardColor = 'default' | 'green' | 'orange';

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule, ProgressBarModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly subtitle = input<string>('');
  readonly color = input<StatCardColor>('default');

  /** Pass a number (e.g. 22) to render the progress bar; omit for plain cards. */
  readonly progressValue = input<number | undefined>(undefined);

  readonly showProgress = computed(() => this.progressValue() !== undefined);

  readonly formattedValue = computed(() => {
    const v = this.value();
    if (typeof v === 'number') {
      return v.toLocaleString();
    }
    return v;
  });
}
