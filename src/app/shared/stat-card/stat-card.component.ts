import { CommonModule } from '@angular/common';
import { Component, computed, input, inject, DestroyRef } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { QuarterPlansService } from '../../core/http/backend_service/quarter-plans.service';
import { AnimateNumberDirective } from '../../core/directives/animate-number.directive';

export type StatCardColor = 'default' | 'green' | 'orange';

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule, ProgressBarModule, AnimateNumberDirective],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly qPlansService = inject(QuarterPlansService);
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly subtitle = input<string>('');
  readonly color = input<StatCardColor>('default');

  readonly isLoading = this.qPlansService.isLoading;
  readonly isError = this.qPlansService.isError;

  readonly isReady = computed(() => !this.isLoading() && !this.isError());

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
