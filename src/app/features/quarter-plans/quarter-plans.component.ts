import { Component } from '@angular/core';
import { QuarterPlansDashboardResponse } from '../../core/models/reponse/quarter-plans-dashboard.response';
import { quarterPlansMock } from '../../core/mock/quarter-plans.mock';
import { ScheduleProgressChartComponent } from './components/schedule-progress-chart/schedule-progress-chart.component';
import { HoursEffortTrackingComponent } from './components/hours-effort-tracking/hours-effort-tracking.component';
import { EpicsByAreaComponent } from './components/epics-by-area/epics-by-area.component';

@Component({
  selector: 'app-quarter-plans',
  standalone: true,
  imports: [ScheduleProgressChartComponent, HoursEffortTrackingComponent, EpicsByAreaComponent],
  templateUrl: './quarter-plans.component.html',
  styleUrl: './quarter-plans.component.scss',
})
export class QuarterPlansComponent {
  readonly quarterPlans: QuarterPlansDashboardResponse = quarterPlansMock; // Use the mock data for demonstration
}
