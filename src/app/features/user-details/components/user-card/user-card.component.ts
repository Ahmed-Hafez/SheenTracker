import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';
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
    avatarUrl: string;
    totalHours: number;
  }>();

  showLinkSystemToAzureButton = input.required<boolean>();
  linkAzureUser = input.required<() => void>();
  foundAzureUserEmail = input.required<string | null>();

  excecuteLinkAzureUser() {
    console.log("Link Azure User button clicked");
    if (this.linkAzureUser) {
      const x: void =this.linkAzureUser()();
    }
  }


  hasImageError = signal(false);

}
