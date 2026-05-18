import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { KpiCardComponent } from '../../../../shared/kpi-card/kpi-card.component';

@Component({
  selector: 'app-user-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [KpiCardComponent],
  templateUrl: './user-summary.component.html',
  styles: ``,
})
export class UserSummaryComponent {
  summary = input.required<{
    projects: number;
    workItems: number;
    dateRange: { days: number; start: string; end: string };
  }>();
}
