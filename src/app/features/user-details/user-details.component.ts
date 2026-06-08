import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
  computed,
  Injector,
  effect,
} from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Skeleton } from 'primeng/skeleton';
import { UserCardComponent } from './components/user-card/user-card.component';
import { TabbarComponent } from './components/tabbar/tabbar.component';
import { ProjectGroup } from './components/work-items-table/work-items-table.component';
import { UserDetailsService } from '../../core/http/backend_service/user-detials-service.service';
import { UserDetailsResponse } from '../../core/models/reponse/user-details.response.model';
import { finalize } from 'rxjs';
import { RefreshService } from '../../core/services/refresh.service';
import { AchievementResponse } from '../../core/models/reponse/achievemetsResponse.model';

@Component({
  selector: 'app-user-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UserCardComponent, TabbarComponent, Skeleton],
  templateUrl: './user-details.component.html',
  styles: ``,
})
export class UserDetailsComponent implements OnInit {
  private userDetailsService = inject(UserDetailsService);
  private readonly refreshService = inject(RefreshService);
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);

  readonly userId = signal<string | null>(null);

  userDetails = signal<UserDetailsResponse | null>(null);
  isLoading = signal(false);
  isError = signal(false);

  user = computed(() => {
    const details = this.userDetails();
    if (!details) return null;

    const displayName = details.user.displayName
      .replace(/@?(?:tildetech.ae|shuratech.com)/gi, '')
      .trim();

    return {
      name: displayName,
      initials: displayName
        .split(' ')
        .map((n) => n[0])
        .join(''),
      avatarUrl: details.user.avatarUrl,
      email1: details.user.email,
      email2: details.user.principalName,
      totalHours: details.totalHours,
    };
  });

  summary = computed(() => {
    const details = this.userDetails();
    if (!details) return null;
    return {
      projects: details.projectsCount,
      workItems: details.workItemsCount,
      dateRange: {
        days: Math.floor(
          (new Date(details.toDate).getTime() - new Date(details.fromDate).getTime()) /
            (1000 * 3600 * 24),
        ),
        start: details.fromDate,
        end: details.toDate,
      },
    };
  });

  workItems = computed<ProjectGroup[]>(() => {
    const details = this.userDetails();
    if (!details) return [];
    return details.projects.map((p) => ({
      projectName: p.projectName,
      totalWorkItems: p.workItems.length,
      totalHours: p.hours.toString(),
      items: p.workItems.map((wi) => ({
        id: `#${wi.id}`,
        title: wi.title,
        type: 'Task',
        status: wi.state,
        deltaHours: `${wi.deltaHours > 0 ? '+' : ''}${wi.deltaHours}h`,
        before: `${wi.previousCompletedWork}h`,
        atEnd: `${wi.currentCompletedWork}h`,
        snapshot: details.toDate,
        isPositiveDelta: wi.deltaHours > 0,
      })),
    }));
  });

  achievements = signal<AchievementResponse | null>(null);
  isAchievementsLoading = signal(false);

  ngOnInit() {
    this.refreshAndLoadDetails();
  }
  private refreshAndLoadDetails() {
    //http://localhost:4200/users?userKey=aad.mtg3owi2njgtzjawmc03ogmxlwe4y2etmtc1mzjiotuyzjc0
    //get user key from browser link
    const userKey = this.route.snapshot.queryParamMap.get('userKey');
    const userID = this.route.snapshot.queryParamMap.get("userID");
    console.log("userKey: " + userKey);
    if (userKey) {
      effect(
        () => {
          this.refreshService.refreshTick();
          this.loadAzureUserDetailsAndWorkItems(userKey);
        },
        { injector: this.injector },
      );
    }
    else if (userID) {
      effect(
        () => {
          this.refreshService.refreshTick();
          // this.loadAzureUserDetailsAndWorkItems(userID);
          this.loadSystemUserDetails(parseInt(userID));
        },
        { injector: this.injector },
      );
    }
  }

  loadAzureUserDetailsAndWorkItems(userId: string) {
    this.isLoading.set(true);
    this.userDetailsService
      .getUserDetails(userId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.userDetails.set(response);
          this.isError.set(false);
          if (response?.user?.key) {
            this.loadAzureUserAchievements(response.user.key);
          }
        },
        error: (error) => {
          console.error('Error fetching user details:', error);
          this.userDetails.set(null);
          this.isError.set(true);
        },
      });
  }
  loadAzureUserAchievements(userKey: string){
    this.isAchievementsLoading.set(true);
    this.userDetailsService
      .getAzureUserAchievements(userKey)
      .pipe(finalize(() => this.isAchievementsLoading.set(false)))
      .subscribe({
        next: (response) => {
          console.log("achievements: ", response);
          this.achievements.set(response);
        },
        error: (error) => {
          console.error('Error fetching user achievements:', error);
        },
      });
  }

  loadSystemUserDetails(userId: number){

  }
}
