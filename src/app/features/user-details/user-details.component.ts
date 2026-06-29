import { SystemUsersService } from './../../core/http/backend_service/system-users.service';
import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  computed,
  Injector,
  effect,
} from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { UserCardComponent } from './components/user-card/user-card.component';
import { TabbarComponent } from './components/tabbar/tabbar.component';
import { UserDetailsService } from '../../core/http/backend_service/user-detials-service.service';
import { of } from 'rxjs';
import { RefreshService } from '../../core/services/refresh.service';
import { SystemUser } from '../../core/models/reponse/system-users.response.model';
import { MetaDataService } from '../../core/http/backend_service/meta-data.service';
import { DateService } from '../../core/services/date.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { AzureUsersSkeletonComponent } from '../azure-users/components/azure-users-skeleton/azure-users-skeleton.component';
import { AzureUserDetail } from '../../core/models/reponse/azure-user-details/user-details.response.model';

@Component({
  selector: 'app-user-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UserCardComponent, TabbarComponent, AzureUsersSkeletonComponent],
  templateUrl: './user-details.component.html',
  styles: ``,
})
export class UserDetailsComponent {
  private readonly userDetailsService = inject(UserDetailsService);
  private readonly refreshService = inject(RefreshService);
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);
  private readonly metaDataService = inject(MetaDataService);
  private readonly appUsersService = inject(SystemUsersService);
  private readonly dateService = inject(DateService);
  isAzureConnectedToSystemUser = signal(false);

  readonly userId = signal<string | null>(null);

  // Azure user mode: userKey present, userID absent
  isAzureUser = computed(() => {
    return !!this.route.snapshot.queryParamMap.get('userKey');
  });
  previousURL = signal<string | null>(null);
  breadcrumbText = computed(() => {
    return !!this.previousURL()?.includes('system') ? 'System Users' : 'Azure Users';
  });
  isSearchingForMatchingAzureUser = signal(false);

  azureUserDetails = signal<AzureUserDetail | null>(null);
  systemUserDetails = signal<SystemUser | null>(null);
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
      const details = this.azureUserDetails();
      console.log(details);
      if (!details) return null;

      const displayName = details.displayName
        .replace(/@?(?:tildetech.ae|shuratech.com)/gi, '')
        .trim();

      return {
        name: displayName,
        initials: displayName
          .split(' ')
          .map((n) => n[0])
          .join(''),
        avatarUrl: details.avatarUrl,
        email1: details.email,
        email2: this.systemUserDetails()?.title || '',
        totalHours: details.workItems.totalHours ?? -1,
      };
    } else {
      // System user mode: user card from systemUser details
      const sUser = this.systemUserDetails();
      if (!sUser) return null;

      const displayName = sUser.fullName.replace(/@?(?:tildetech.ae|shuratech.com)/gi, '').trim();

      return {
        name: displayName,
        initials: displayName
          .split(' ')
          .map((n) => n[0])
          .join(''),
        avatarUrl: this.azureUserDetails()?.avatarUrl || '',
        email1: sUser.email,
        email2: sUser.title,
        totalHours: this.azureUserDetails()?.workItems.totalHours || -1,
      };
    }
  });

  queryParams = toSignal(this.route.queryParamMap);
  constructor() {
    const state = history.state;
    if (state?.from) this.previousURL.set(state.from);
    effect(
      () => {
        this.refreshService.refreshTick(); // re-run effect on manual refresh trigger
        this.dateService.selectedDateRange(); // re-run effect on date range change

        const params = this.queryParams();
        const userKey = params?.get('userKey');
        const userID = params?.get('userId');

        this.reset();

        if (userKey) {
          this.loadAzureUserDetails(userKey);
        } else if (userID) {
          this.loadSystemUserDetails(+userID);
        }
      },
      { injector: this.injector },
    );
  }

  private reset() {
    this.userId.set(null);
    this.azureUserDetails.set(null);
    this.systemUserDetails.set(null);
    this.resolvedAzureUserKey.set(null);
    this.foundAzureUserKey.set(null);
    this.foundAzureUserEmail.set(null);
    this.isAzureLoading.set(false);
    this.isSystemUserLoading.set(false);
    this.isError.set(false);
  }

  loadAzureUserDetails(userId: string) {
    this.isAzureLoading.set(true);
    this.userDetailsService.getUserDetails(userId).subscribe({
      next: (response) => {
        this.azureUserDetails.set(response);
        this.isAzureLoading.set(false);
        console.log('Azure user details:', this.azureUserDetails);
        this.isError.set(false);
        if (response.isLinked) {
          if (this.systemUserDetails() === null) {
            this.loadSystemUserDetails(response.azureUserKey);
          }
        }
      },
      error: (error) => {
        this.isAzureLoading.set(false);
        console.error('Error fetching user details:', error);
        this.azureUserDetails.set(null);
        this.isError.set(true);
      },
    });
  }

  loadSystemUserDetails(userId: number | string) {
    this.isSystemUserLoading.set(true);
    this.userDetailsService.getSystemUserDetails(userId).subscribe({
      next: (response) => {
        this.systemUserDetails.set(response);
        this.isError.set(false);
        if (this.azureUserDetails() === null) {
          if (response.azureUserKey) {
            this.isAzureConnectedToSystemUser.set(true);
            // System user has an azure key → load work items & achievements
            this.resolvedAzureUserKey.set(response.azureUserKey);
            this.loadAzureUserDetails(response.azureUserKey);
          } else {
            this.isSearchingForMatchingAzureUser.set(true);
            this.checkAndFindAzureUserKey(response.email);
          }
        }
      },
      error: (error) => {
        console.error('Error fetching system user details:', error);
        this.systemUserDetails.set(null);
        if (error.status !== 404) {
          this.isError.set(true);
        }
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
    const systemUser = this.systemUserDetails();
    const azureKey = this.foundAzureUserKey();
    if (systemUser && azureKey) {
      this.userDetailsService.linkAzureUser(systemUser.id, azureKey).subscribe({
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
    let show: boolean =
      !this.systemUserDetails()?.azureUserKey && this.foundAzureUserKey() ? true : false;
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
