import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { User } from '../../../../core/models/reponse/azure-users.response.model';
import { Table, TableModule } from 'primeng/table';
import { HoursBadgeComponent } from '../../../../shared/hours-badge/hours-badge.component';
import { Router } from '@angular/router';
import { Popover, PopoverModule } from 'primeng/popover';
import { GoalStatusBadgeComponent } from '../../../../shared/goal-badge/goal-badge.component';
import { DateService } from '../../../../core/services/date.service';
import { UsersService } from '../../../../core/http/backend_service/azure-users.service';
import { ExpectedHoursTdComponent } from '../expected-hours-td/expected-hours-td.component';

type Breakpoint = 'md' | 'lg';

interface Column {
  field: string;
  header: string;
  sortField?: string;
  minWidth?: string;
  hideBelow?: Breakpoint;
}

const HIDE_BELOW_CLASSES: Record<Breakpoint, string> = {
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
};

@Component({
  selector: 'app-azure-users-table',
  imports: [
    TableModule,
    HoursBadgeComponent,
    PopoverModule,
    GoalStatusBadgeComponent,
    ExpectedHoursTdComponent,
  ],
  templateUrl: './azure-users-table.component.html',
})
export class AzureUsersTableComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly dateService = inject(DateService);
  private readonly userService = inject(UsersService);

  azureUsersTable = viewChild<Table<User>>('azureUsersTable');
  first = 0;

  users = input.required<User[]>();
  userDialogVisible = signal(false);
  deleteRequestVisible = signal(false);
  actionTaken = output<void>();

  popupMenu = viewChild<Popover>('op');

  selectedUser = signal<User | null>(null);

  targetHours$ = this.dateService.targetHoursCount;

  columns!: Column[];
  visibilityClasses: Record<string, string> = {};

  ngOnInit(): void {
    this.initializeTableColumns();
  }

  initializeTableColumns() {
    this.columns = [
      { field: 'displayName', header: 'Name', minWidth: '12rem' },
      { field: 'email', header: 'Email', minWidth: '12rem', hideBelow: 'lg' },
      { field: 'totalHours', header: 'Total Hours' },
      { field: 'expectedHours', header: 'Expected Hours' },
      {
        field: 'hoursPerDay',
        header: 'Hours Per Day',
        sortField: 'expectedHours',
        hideBelow: 'md',
      },
      { field: 'goal', header: 'Goal' },
      { field: 'projectsCount', header: 'Projects', hideBelow: 'md' },
      { field: 'workItemsCount', header: 'Work Items', hideBelow: 'md' },
      { field: 'Actions', header: 'Actions' },
    ];

    this.visibilityClasses = Object.fromEntries(
      this.columns.map((col) => [
        col.field,
        col.hideBelow ? HIDE_BELOW_CLASSES[col.hideBelow] : '',
      ]),
    );
  }

  fixDisplayName(name: string): string {
    return name.replace(/@?(?:tildetech.ae|shuratech.com)/gi, '').trim();
  }

  resetToFirstPage() {
    this.first = 0;
  }

  openMenuPopup(event: Event, user: User) {
    this.popupMenu()?.toggle(event);
    this.selectedUser.set(user);
  }

  showDetails(userKey: string) {
    this.router.navigate(['/users'], {
      state: { from: this.router.url },
      queryParams: { userKey: userKey },
    });
  }

  onImageError(event: Event, userkey: string) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'https://api.dicebear.com/9.x/personas/svg?seed=' + userkey;
  }
}
