import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { OverviewComponent } from './components/overview/overview.component';
import { WorkItemsComponent } from './components/work-items/work-items.component';
import { AchievementsComponent } from './components/achievements/achievements.component';
import { SystemUserDetails } from '../../../../core/models/reponse/system-user-details.response.model';

@Component({
  selector: 'app-tabbar',
  standalone: true,
  imports: [TabsModule, OverviewComponent, WorkItemsComponent, AchievementsComponent],
  templateUrl: './tabbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabbarComponent {
  summary = input.required<any>();
  workItems = input.required<any>();
  achievements = input.required<any>();
  isAchievementsLoading = input<boolean>(false);
  disableAzureTabs = input<boolean>(false);
  systemUser = input<SystemUserDetails | null>(null);
}
