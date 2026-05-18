import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { HoursBadgeComponent } from '../../../../shared/hours-badge/hours-badge.component';

@Component({
  selector: 'app-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HoursBadgeComponent],
  templateUrl: './user-card.component.html',
  styles: ``,
})
export class UserCardComponent {
  user = input.required<{
    name: string;
    initials: string;
    email1: string;
    email2: string;
    totalHours: number;
  }>();
}
