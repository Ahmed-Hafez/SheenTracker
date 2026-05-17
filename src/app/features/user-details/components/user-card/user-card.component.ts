import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
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
