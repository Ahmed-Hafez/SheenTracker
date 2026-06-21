import { SystemUsersService } from './../../core/http/backend_service/system-users.service';
import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
  computed,
  Injector,
  effect,
  viewChild,
} from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Skeleton } from 'primeng/skeleton';
import { UserCardComponent } from './components/user-card/user-card.component';
import { TabbarComponent } from './components/tabbar/tabbar.component';
import { ProjectGroup } from './components/work-items-table/work-items-table.component';
import { UserDetailsService } from '../../core/http/backend_service/user-detials-service.service';
import { UserDetailsResponse } from '../../core/models/reponse/user-details.response.model';
import { finalize, of } from 'rxjs';
import { RefreshService } from '../../core/services/refresh.service';
import { AchievementResponse } from '../../core/models/reponse/achievemetsResponse.model';
import { SystemUser } from '../../core/models/reponse/system-users.response.model';
import { MetaDataService } from '../../core/http/backend_service/meta-data.service';
import { DateService } from '../../core/services/date.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UserCardComponent, TabbarComponent, Skeleton],
  templateUrl: './user-details.component.html',
  styles: ``,
})
export class UserDetailsComponent {
  private userDetailsService = inject(UserDetailsService);
  private readonly refreshService = inject(RefreshService);
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);
  private readonly metaDataService = inject(MetaDataService);
    private readonly appUsersService = inject(SystemUsersService);
    private readonly dateService = inject(DateService);


  readonly userId = signal<string | null>(null);

  // Azure user mode: userKey present, userID absent
  isAzureUser = computed(() => {
    return !!this.route.snapshot.queryParamMap.get('userKey');
  });
  isSearchingForMatchingAzureUser = signal(false);

  userDetails = signal<UserDetailsResponse | null>(null);
  systemUser = signal<SystemUser | null>(null);
  // Holds the azure user key found from system user details or metadata lookup
  resolvedAzureUserKey = signal<string | null>(null);
  // Holds a matched azure key from metadata (for showing "link to azure user" button)
  foundAzureUserKey = signal<string | null>(null);
  foundAzureUserEmail = signal<string | null>(null);
  isAzureLoading = signal(false);
  isSystemUserLoading = signal(false);
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
        type: wi.workItemType,
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


  queryParams = toSignal(this.route.queryParamMap);
  constructor() {
  effect(
    () => {
      this.refreshService.refreshTick();// re-run effect on manual refresh trigger
      this.dateService.selectedDateRange(); // re-run effect on date range change

      const params = this.queryParams();
      const userKey = params?.get('userKey');
      const userID = params?.get('userId');

      this.reset();

      if (userKey) {
        this.loadAzureUserDetailsAndWorkItems(userKey);
      } else if (userID) {
        this.loadSystemUserDetails(+userID);
      }
    },
    { injector: this.injector }
  );
}

    private reset(){
      this.userId.set(null);
      this.userDetails.set(null);
      this.systemUser.set(null);
      this.resolvedAzureUserKey.set(null);
      this.foundAzureUserKey.set(null);
      this.foundAzureUserEmail.set(null);
      this.isAzureLoading.set(false);
      this.isSystemUserLoading.set(false);
      this.isError.set(false);
  }
  loadAzureUserDetailsAndWorkItems(userId: string) {
    this.isAzureLoading.set(true);
    this.userDetailsService
      .getUserDetails(userId)
      .pipe(finalize(() => {
        //delay by 100 ms to prevent loading spinner flash on fast responses
        setTimeout(() => {
          this.isAzureLoading.set(false);
        }, 100);
      }))
      .subscribe({
        next: (response) => {
          this.userDetails.set(response);
          this.isError.set(false);
          if (response?.user?.key) {
            this.loadAzureUserAchievements(response.user.key);
            if(this.systemUser() === null){
             this.loadSystemUserDetails(response.user.key);
          }
          }



        },
        error: (error) => {
          this.isAzureLoading.set(false);
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

  loadSystemUserDetails(userId: number| string) {
    this.isSystemUserLoading.set(true);
    this.userDetailsService
      .getSystemUserDetails(userId)
      .pipe(finalize(() => {
        //delay by 100 ms to prevent loading spinner flash on fast responses
        setTimeout(() => {
          this.isSystemUserLoading.set(false);
        }, 100);
      }))
      .subscribe({
        next: (response) => {
          this.systemUser.set(response);

          this.isError.set(false);

          if(this.userDetails() === null){
            if (response.azureUserKey) {
            // System user has an azure key → load work items & achievements
            this.resolvedAzureUserKey.set(response.azureUserKey);
            this.loadAzureUserDetailsAndWorkItems(response.azureUserKey);
          } else {
            this.isSearchingForMatchingAzureUser.set(true);
            this.checkAndFindAzureUserKey(response.email);
          }
          }


        },
        error: (error) => {
          console.error('Error fetching system user details:', error);
          this.systemUser.set(null);
          if(error.status !== 404){this.isError.set(true);}

        },
      });
  }

  private checkAndFindAzureUserKey(email: string) {
    if (this.metaDataService.metaDataUsers$().length === 0) {
      this.isSearchingForMatchingAzureUser.set(true);
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
    this.isSearchingForMatchingAzureUser.set(true);
    const emailPrefix = email.split('@')[0].toLowerCase();

    const foundUser = this.metaDataService.metaDataUsers$().find((u) => {
      const userPrefix = u.email.split('@')[0].toLowerCase();
      return userPrefix === emailPrefix;
    });
    console.log('Matching system user email to metadata users:', { email, foundUser });
    this.foundAzureUserEmail.set(foundUser?.email ?? null);

    this.foundAzureUserKey.set(foundUser?.userKey ?? null);
    this.isSearchingForMatchingAzureUser.set(false);
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


  deleteUser(userKey: number | undefined) {
      if (!userKey) {
        return of(null);
      }
      // Implement the actual API call to delete the user
      return this.appUsersService.deleteAppUser(userKey);
    }


}
