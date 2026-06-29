import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { KpiCardComponent } from '../../../../shared/kpi-card/kpi-card.component';
import { DateService } from '../../../../core/services/date.service';
import { UserSummary } from '../tabbar/components/overview/overview.component';

@Component({
  selector: 'app-user-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [KpiCardComponent, DatePipe],
  templateUrl: './user-summary.component.html',
  styles: ``,
})
export class UserSummaryComponent {
  dateService = inject(DateService);
  dateRange = this.dateService.selectedDateRange;
  summary = input.required<UserSummary>();
}
