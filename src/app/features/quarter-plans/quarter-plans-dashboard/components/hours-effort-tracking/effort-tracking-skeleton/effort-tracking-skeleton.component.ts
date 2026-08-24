import { Component } from '@angular/core';

@Component({
  selector: 'app-effort-tracking-skeleton',
  imports: [],
  templateUrl: './effort-tracking-skeleton.component.html',
  styleUrl: './effort-tracking-skeleton.component.scss',
})
export class EffortTrackingSkeletonComponent {
  readonly metricCards = [
    { id: 'total-effort', labelWidth: 70, valueWidth: 90, subWidth: 100, hasBar: false },
    { id: 'logged-closed', labelWidth: 110, valueWidth: 80, subWidth: 110, hasBar: false },
    { id: 'remaining', labelWidth: 100, valueWidth: 85, subWidth: 80, hasBar: false },
    { id: 'completion', labelWidth: 105, valueWidth: 120, subWidth: 0, hasBar: true },
  ];

  readonly panels = [
    { id: 'q-plan', boxed: true, rows: [90, 100] },
    { id: 'connected', boxed: true, rows: [60, 110] },
    { id: 'execution', boxed: false, rows: [80, 40, 50, 55] },
  ];
}
