import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { UserSummaryComponent } from '../../../user-summary/user-summary.component';
import { SystemUser } from '../../../../../../core/models/reponse/system-users.response.model';
import { Router } from '@angular/router';
import{ inject } from '@angular/core';
import { Departments } from '../../../../../../core/enums/departments.enum';
import { Seniorities } from '../../../../../../core/enums/seniority.enum';
import { EnumLabelPipe } from '../../../../../../core/pipes/enum-label-pipe';
@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [UserSummaryComponent, EnumLabelPipe],
  templateUrl: './overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewComponent {
  router = inject(Router);
  summary = input.required<any>();
  systemUser = input.required<SystemUser | null>();
  departments = Departments;
  seniorities = Seniorities;

   navigateToUser(userId: number|null|undefined): void {
    console.log('Navigating to user details for userId:', userId);
    if(userId === null || userId === undefined) {
      console.warn('User ID is null or undefined in overview tab. Cannot navigate to user details.');
      return;
    }


    const url = this.router.serializeUrl(
  this.router.createUrlTree(['/users'], {
    queryParams: { userId }
  })
);

window.open(url, '_blank');
  }
}
