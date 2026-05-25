import { Component, DestroyRef, effect, inject, Injector, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SliderModule } from 'primeng/slider';
import { UsersService } from '../../core/http/backend_service/azure-users.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { SystemUsersSkeletonComponent } from './components/system-users-skeleton/system-users-skeleton.component';
import { SystemUsersTableComponent } from './components/system-users-table/system-users-table.component';
import { RefreshService } from '../../core/services/refresh.service';
import { UserFormDialogComponent } from './components/user-form-dialog/user-form-dialog.component';
import { SystemUsersService } from '../../core/http/backend_service/system-users.service';

@Component({
  selector: 'app-system-users',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MultiSelectModule,
    ToggleSwitchModule,
    SliderModule,
    UserFormDialogComponent,
    SystemUsersTableComponent,
    SystemUsersSkeletonComponent
],
  templateUrl: './system-users.component.html',
})
export class SystemUsersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly systemUsers = inject(SystemUsersService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly refreshService = inject(RefreshService);
  private readonly injector = inject(Injector);
  userDialogVisible = signal(false);

  readonly loading = signal(true);
  users$ = this.systemUsers.users$;
  projects$ = this.systemUsers.projects$;

  searchTerm = '';
  usersFilterForm!: FormGroup;

  ngOnInit(): void {
    this.initializeFilters();

    // this.usersFilterForm.valueChanges
    //   .pipe(startWith(this.usersFilterForm.getRawValue()), takeUntilDestroyed(this.destroyRef))
    //   .subscribe(() => this.onFilterChange());

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
      projects: [''],
      hoursRange: ['200'],
      zeroHoursUsers: [true],
    });
  }

  // onFilterChange(): void {
  //   const { searchTerm, projects, hoursRange, zeroHoursUsers } = this.usersFilterForm.value;
  //   this.usersService.filterUsers(searchTerm, projects, hoursRange, zeroHoursUsers);
  // }

  private loadUsers(): void {
    this.loading.set(true);
    this.systemUsers.getAppUsers().subscribe({
      next: () => {
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
