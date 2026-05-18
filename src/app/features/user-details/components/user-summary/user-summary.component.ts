import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { KpiCardComponent } from '../../../../shared/kpi-card/kpi-card.component';
import { DateService } from '../../../../core/services/date.service';

@Component({
  selector: 'app-user-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [KpiCardComponent, DatePipe],
  templateUrl: './user-summary.component.html',
  styles: ``,
})
export class UserSummaryComponent {
  dateService= inject(DateService);
  summary = input.required<{
    projects: number;
    workItems: number;
    dateRange: { days: number; start: string; end: string };
  }>();
}
