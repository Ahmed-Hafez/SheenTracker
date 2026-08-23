import { Component, inject, OnInit } from '@angular/core';
import { QuarterPlansDashboardResponse } from '../../core/models/reponse/quarter-plans-dashboard.response';
import { quarterPlansMock } from '../../core/mock/quarter-plans.mock';
import { ScheduleProgressChartComponent } from './components/schedule-progress-chart/schedule-progress-chart.component';
import { HoursEffortTrackingComponent } from './components/hours-effort-tracking/hours-effort-tracking.component';
import { EpicsByAreaComponent } from './components/epics-by-area/epics-by-area.component';
import { QuarterPlansService } from '../../core/http/backend_service/quarter-plans.service';
import { QuarterYearService } from '../../core/services/quarter-year.service';

@Component({
  selector: 'app-quarter-plans',
  standalone: true,
  imports: [ScheduleProgressChartComponent, HoursEffortTrackingComponent, EpicsByAreaComponent],
  templateUrl: './quarter-plans.component.html',
  styleUrl: './quarter-plans.component.scss',
})
export class QuarterPlansComponent implements OnInit {
  private readonly quarterPlansService = inject(QuarterPlansService);
  private readonly quarterDateService = inject(QuarterYearService);
  readonly qPlansDashboardData = this.quarterPlansService.qplansDashboardData;

  ngOnInit() {
    this.getQPlansDashboardData();
    console.log(this.quarterDateService.getAvailableQuarters());
  }

  getQPlansDashboardData() {
    this.quarterPlansService.isLoading.set(true);
    this.quarterPlansService.getQuarterPlansDashboardData().subscribe({
      next: (data) => {
        this.quarterPlansService.isLoading.set(false);
        this.quarterPlansService.qplansDashboardData.set(data);
      },
      error: () => {
        this.quarterPlansService.isLoading.set(false);
        this.quarterPlansService.isError.set(true);
      },
    });
  }
}
