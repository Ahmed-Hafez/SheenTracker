import { Component, DestroyRef, effect, inject, Injector, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SelectModule } from 'primeng/select';
import { TieredMenuModule } from 'primeng/tieredmenu';

import { SystemUsersSkeletonComponent } from './components/system-users-skeleton/system-users-skeleton.component';
import { SystemUsersTableComponent } from './components/system-users-table/system-users-table.component';
import { RefreshService } from '../../core/services/refresh.service';
import { UserFormDialogComponent } from '../../shared/user-form-dialog/user-form-dialog.component';
import { SystemUsersService } from '../../core/http/backend_service/system-users.service';
import { MenuItem } from 'primeng/api';
import { Departments } from '../../core/enums/departments.enum';
import { startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-system-users',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    UserFormDialogComponent,
    SystemUsersTableComponent,
    SystemUsersSkeletonComponent,
    SelectModule,
    TieredMenuModule,
  ],
  templateUrl: './system-users.component.html',
})
export class SystemUsersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly systemUsersService = inject(SystemUsersService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly refreshService = inject(RefreshService);
  private readonly injector = inject(Injector);
  userDialogVisible = signal(false);

  readonly loading = signal(true);
  users = this.systemUsersService.users$;

  searchTerm = '';
  usersFilterForm!: FormGroup;

  departments = Departments;
  userTypes = ['Linked', 'Unlinked'];
  items: MenuItem[] | undefined;

  ngOnInit(): void {
    this.initializeFilters();

    this.items = [
      {
        label: 'Export to CSV',
        icon: 'pi pi-file',
      },
      {
        label: 'Import from CSV',
        icon: 'pi pi-file-import',
      },
    ];

    this.usersFilterForm.valueChanges
      .pipe(startWith(this.usersFilterForm.getRawValue()), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onFilterChange());

    effect(
      () => {
        this.refreshService.refreshTick();
        this.loadUsers();
      },
      { injector: this.injector },
    );
  }

  initializeFilters(): void {
    this.usersFilterForm = this.fb.group({
      searchTerm: [''],
      department: [null],
      userType: [null],
      squad: [null],
    });
  }

  onFilterChange(): void {
    const { searchTerm, department, userType, squad } = this.usersFilterForm.value;
    this.systemUsersService.filterUsers(searchTerm, squad, department, userType);
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.systemUsersService.getSystemUsers().subscribe({
      next: (users) => {
        // this.onFilterChange();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  exportToCSV(): void {
    // this.systemUsers.exportUsersToCSV(this.users$());
  }

  showUserPopup() {
    this.userDialogVisible.set(true);
  }

  onDialogVisibleChange($event: boolean) {
    this.userDialogVisible.set($event);
  }
}
