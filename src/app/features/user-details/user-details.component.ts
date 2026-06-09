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
import { SystemUserDetails } from '../../core/models/reponse/system-user-details.response.model';
import { MetaDataService } from '../../core/http/backend_service/meta-data.service';

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
  private readonly metaDataService = inject(MetaDataService);

  readonly userId = signal<string | null>(null);

  // Azure user mode: userKey present, userID absent
  isAzureUser = computed(() => {
    return !!this.route.snapshot.queryParamMap.get('userKey');
  });

  userDetails = signal<UserDetailsResponse | null>(null);
  systemUser = signal<SystemUserDetails | null>(null);
  // Holds the azure user key found from system user details or metadata lookup
  resolvedAzureUserKey = signal<string | null>(null);
  // Holds a matched azure key from metadata (for showing "link to azure user" button)
  foundAzureUserKey = signal<string | null>(null);
  foundAzureUserEmail = signal<string | null>(null);
  isLoading = signal(false);
  isError = signal(false);

  // For system user: azure tabs are disabled when we have no azure key at all
  disableAzureTabs = computed(() => {
    if (this.isAzureUser()) return false;
    return !this.resolvedAzureUserKey();
  });

  user = computed(() => {
    if (this.isAzureUser()) {
      // Azure mode: user card populated from work-items API response
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
    } else {
      // System user mode: user card from systemUser details
      const sUser = this.systemUser();
      if (!sUser) return null;

      const displayName = sUser.fullName.replace(/@?(?:tildetech.ae|shuratech.com)/gi, '').trim();

      return {
        name: displayName,
        initials: displayName
          .split(' ')
          .map((n) => n[0])
          .join(''),
        avatarUrl: this.userDetails()?.user?.avatarUrl || '',
        email1: sUser.email,
        email2: sUser.title,
        totalHours: this.userDetails()?.totalHours || 0,
      };
    }
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
    const userKey = this.route.snapshot.queryParamMap.get('userKey');
    const userID = this.route.snapshot.queryParamMap.get('userId');

    if (userKey) {
      // Azure user mode
      effect(
        () => {
          this.refreshService.refreshTick();
          this.loadAzureUserDetailsAndWorkItems(userKey);
        },
        { injector: this.injector },
      );
    } else if (userID) {
      // System user mode
      effect(
        () => {
          this.refreshService.refreshTick();
          this.loadSystemUserDetails(parseInt(userID));
        },
        { injector: this.injector },
      );
    }
  }

  loadAzureUserDetailsAndWorkItems(userId: string) {
    this.isLoading.set(true);
    this.userDetailsService.getUserDetails(userId).subscribe({
      next: (response) => {
        this.userDetails.set(response);
        this.isError.set(false);
        if (response?.user?.key) {
          this.loadAzureUserAchievements(response.user.key);
        }
        setTimeout(() => {
          this.loadSystemUserDetails(response.user.key, false);
        }, 1000);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error fetching user details:', error);
        this.userDetails.set(null);
        this.isError.set(true);
      },
    });
  }

  loadAzureUserAchievements(userKey: string) {
    this.isAchievementsLoading.set(true);
    this.userDetailsService
      .getAzureUserAchievements(userKey)
      .pipe(finalize(() => this.isAchievementsLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.achievements.set(response);
        },
        error: (error) => {
          console.error('Error fetching user achievements:', error);
        },
      });
  }

  loadSystemUserDetails(userId: number | string, checkForAzureKey: boolean = true) {
    this.isLoading.set(true);
    this.userDetailsService
      .getSystemUserDetails(userId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.systemUser.set(response);

          this.isError.set(false);

          if (checkForAzureKey) {
            if (response.azureUserKey) {
              // System user has an azure key → load work items & achievements
              this.resolvedAzureUserKey.set(response.azureUserKey);
              this.loadAzureUserDetailsAndWorkItems(response.azureUserKey);
            } else {
              // No azure key → search metadata for email match
              this.checkAndFindAzureUserKey(response.email);
            }
          }
        },
        error: (error) => {
          console.error('Error fetching system user details:', error);
          this.systemUser.set(null);
          if (error.status !== 404) {
            this.isError.set(true);
          }
        },
      });
  }

  private checkAndFindAzureUserKey(email: string) {
    if (this.metaDataService.metaDataUsers$().length === 0) {
      this.metaDataService.getAzureUsersMetaData().subscribe({
        next: () => {
          this.matchEmailToUserKey(email);
        },
        error: (err) => {
          console.error('Error loading metadata users:', err);
        },
      });
    } else {
      this.matchEmailToUserKey(email);
    }
  }

  private matchEmailToUserKey(email: string) {
    const emailPrefix = email.split('@')[0].toLowerCase();

    const foundUser = this.metaDataService.metaDataUsers$().find((u) => {
      const userPrefix = u.email.split('@')[0].toLowerCase();
      return userPrefix === emailPrefix;
    });
    console.log('Matching system user email to metadata users:', { email, foundUser });
    this.foundAzureUserEmail.set(foundUser?.email ?? null);

    this.foundAzureUserKey.set(foundUser?.userKey ?? null);
  }

  linkAzureUser() {
    console.log('system user:', this.systemUser());
    console.log('found azure key:', this.foundAzureUserKey());
    const sUser = this.systemUser();
    const azureKey = this.foundAzureUserKey();
    if (sUser && azureKey) {
      this.userDetailsService.linkAzureUser(sUser.id, azureKey).subscribe({
        next: () => {
          window.location.reload();
        },
        error: (err) => {
          console.error('Error linking user to Azure:', err);
        },
      });
    }
  }
  showLinkSystemToAzureButton(): boolean {
    let show: boolean = !this.systemUser()?.azureUserKey && this.foundAzureUserKey() ? true : false;
    return show;
  }
}
