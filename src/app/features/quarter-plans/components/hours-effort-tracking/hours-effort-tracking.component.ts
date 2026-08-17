import { Component, input } from '@angular/core';
import { QuarterPlansDashboardResponse } from '../../../../core/models/reponse/quarter-plans-dashboard.response';
import { StatCardComponent } from '../../../../shared/stat-card/stat-card.component';

@Component({
  selector: 'app-hours-effort-tracking',
  imports: [StatCardComponent],
  templateUrl: './hours-effort-tracking.component.html',
  styleUrl: './hours-effort-tracking.component.scss',
})
export class HoursEffortTrackingComponent {
  quarterPlans = input.required<QuarterPlansDashboardResponse>();
}
