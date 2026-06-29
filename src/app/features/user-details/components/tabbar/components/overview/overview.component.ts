import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { UserSummaryComponent } from '../../../user-summary/user-summary.component';
import { SystemUser } from '../../../../../../core/models/reponse/system-users.response.model';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { Departments } from '../../../../../../core/enums/departments.enum';
import { Seniorities } from '../../../../../../core/enums/seniority.enum';
import { EnumLabelPipe } from '../../../../../../core/pipes/enum-label-pipe';
import { DateRange } from '../../../../../../core/services/date.service';

export interface UserSummary {
  projects: number;
  workItems: number;
}
@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [UserSummaryComponent, EnumLabelPipe],
  templateUrl: './overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewComponent {
  router = inject(Router);
  summary = input.required<UserSummary>();
  systemUser = input.required<SystemUser | null>();
  departments = Departments;
  seniorities = Seniorities;

  navigateToUser(userId: number | null | undefined): void {
    console.log('Navigating to user details for userId:', userId);
    if (userId === null || userId === undefined) {
      console.warn(
        'User ID is null or undefined in overview tab. Cannot navigate to user details.',
      );
      return;
    }

    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/users'], {
        queryParams: { userId },
      }),
    );

    window.open(url, '_blank');
  }

  navigateToSquad(squadId: number | null | undefined): void {
    console.log('Navigating to squad details for squadId:', squadId);
    if (squadId === null || squadId === undefined) {
      console.warn(
        'Squad ID is null or undefined in overview tab. Cannot navigate to squad details.',
      );
      return;
    }
    const url = this.router.serializeUrl(
      // squads/1
      this.router.createUrlTree(['squads', squadId]),
    );

    window.open(url, '_blank');
  }
}
