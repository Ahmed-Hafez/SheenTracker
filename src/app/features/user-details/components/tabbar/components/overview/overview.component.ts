import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { UserSummaryComponent } from '../../../user-summary/user-summary.component';
import { SystemUserDetails } from '../../../../../../core/models/reponse/system-user-details.response.model';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [UserSummaryComponent],
  templateUrl: './overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewComponent {
  router = inject(Router);
  summary = input.required<any>();
  systemUser = input.required<SystemUserDetails | null>();

  navigateToUser(userId: number | null | undefined): void {
    if (userId === null || userId === undefined) {
      console.warn(
        'User ID is null or undefined in overview tab. Cannot navigate to user details.',
      );
      return;
    }
    this.router.navigate(['/users'], {
      queryParams: { userId: userId },
    });
  }
}
