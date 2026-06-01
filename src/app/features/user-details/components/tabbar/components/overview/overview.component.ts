import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { UserSummaryComponent } from '../../../user-summary/user-summary.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [UserSummaryComponent],
  templateUrl: './overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewComponent {
  summary = input.required<any>();
}
