import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-user-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
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
