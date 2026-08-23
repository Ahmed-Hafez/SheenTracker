import { Component } from '@angular/core';

@Component({
  selector: 'app-schedule-progress-chart-skeleton',
  imports: [],
  templateUrl: './schedule-progress-chart-skeleton.component.html',
  styleUrl: './schedule-progress-chart-skeleton.component.scss',
})
export class ScheduleProgressChartSkeletonComponent {
  // Two bars mimicking "Calendar Elapsed" (longer) and "Effort Completed" (shorter)
  readonly barWidths = [53, 28];
  readonly ticks = Array.from({ length: 11 }); // 0,10,...,100
  readonly legendItems = [1, 2];
}
