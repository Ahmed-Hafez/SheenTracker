import { Component, DestroyRef, inject, Injector } from '@angular/core';
import { QuarterPlansService } from '../../../core/http/backend_service/quarter-plans.service';
import { EpicsByAreaComponent } from './components/epics-by-area/epics-by-area.component';
import { EpicsByTaskTypeComponent } from './components/epics-by-task-type/epics-by-task-type.component';
import { HoursEffortTrackingComponent } from './components/hours-effort-tracking/hours-effort-tracking.component';
import { ScheduleProgressChartComponent } from './components/schedule-progress-chart/schedule-progress-chart.component';

@Component({
  selector: 'app-quarter-plans',
  imports: [
    ScheduleProgressChartComponent,
    HoursEffortTrackingComponent,
    EpicsByAreaComponent,
    EpicsByTaskTypeComponent,
  ],
  templateUrl: './quarter-plans.component.html',
  styleUrl: './quarter-plans.component.scss',
})
export class QuarterPlansComponent {
  private readonly quarterPlansService = inject(QuarterPlansService);
  readonly qPlansDashboardData = this.quarterPlansService.qplansDashboardData;

  constructor() {
    // Refetches whenever the quarter picked in the topbar changes.
    this.quarterPlansService.trackSelectedQuarter(inject(DestroyRef), inject(Injector));
  }
}
