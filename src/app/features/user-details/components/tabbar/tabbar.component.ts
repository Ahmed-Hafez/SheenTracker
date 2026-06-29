import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { OverviewComponent, UserSummary } from './components/overview/overview.component';
import { WorkItemsComponent } from './components/work-items/work-items.component';
import { AchievementsComponent } from './components/achievements/achievements.component';
import { SystemUser } from '../../../../core/models/reponse/system-users.response.model';
import { AzureUserDetail } from '../../../../core/models/reponse/azure-user-details/user-details.response.model';
import { DateService } from '../../../../core/services/date.service';

@Component({
  selector: 'app-tabbar',
  standalone: true,
  imports: [TabsModule, OverviewComponent, WorkItemsComponent, AchievementsComponent],
  templateUrl: './tabbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabbarComponent {
  private readonly dateService = inject(DateService);
  azureUser = input<AzureUserDetail | null>();
  disableAzureTabs = input<boolean>(false);
  systemUser = input<SystemUser | null>(null);

  summary = computed<UserSummary>(() => {
    return {
      projects: this.azureUser()?.workItems.projectsCount ?? 0,
      workItems: this.azureUser()?.workItems.workItemsCount ?? 0,
    };
  });
}
