import {
  Component,
  ChangeDetectionStrategy,
  computed,
  effect,
  inject,
  Injector,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserCardComponent } from './components/user-card/user-card.component';
import { UserSummaryComponent } from './components/user-summary/user-summary.component';
import {
  WorkItemsTableComponent,
  ProjectGroup,
} from './components/work-items-table/work-items-table.component';
import { UserDetailsService } from '../../core/http/backend_service/user-detials-service.service';
import { RefreshService } from '../../core/services/refresh.service';

@Component({
  selector: 'app-user-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UserCardComponent, UserSummaryComponent, WorkItemsTableComponent],
  templateUrl: './user-details.component.html',
  styles: ``,
})
export class UserDetailsComponent implements OnInit {
  private userDetailsService = inject(UserDetailsService);
  private readonly refreshService = inject(RefreshService);
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);

  readonly userId = signal<string | null>(null);

  userDetails = this.userDetailsService.userDetails$;

  user = computed(() => {
    const details = this.userDetails();
    if (!details) return null;
    return {
      name: details.user.displayName,
      initials: details.user.displayName
        .split(' ')
        .map((n) => n[0])
        .join(''),
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

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('userId');
    if (id) {
      this.userId.set(id);
    }

    effect(
      () => {
        this.refreshService.refreshTick();
        this.loadUserDetails();
      },
      { injector: this.injector },
    );
  }

  private loadUserDetails(): void {
    const id = this.userId();
    if (!id) return;
    this.userDetailsService.getUserDetails(id);
  }
}
