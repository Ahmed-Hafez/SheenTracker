import { Component, DestroyRef, effect, inject, Injector, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { Checkbox } from 'primeng/checkbox';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SliderModule } from 'primeng/slider';
import { UsersService } from '../../core/http/backend_service/users.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { UsersSkeletonComponent } from './components/users-skeleton/users-skeleton.component';
import { UsersTableComponent } from './components/users-table/users-table.component';
import { RefreshService } from '../../core/services/refresh.service';

@Component({
  selector: 'app-users',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MultiSelectModule,
    ToggleSwitchModule,
    SliderModule,
    UsersSkeletonComponent,
    UsersTableComponent,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly refreshService = inject(RefreshService);
  private readonly injector = inject(Injector);
  readonly loading = signal(true);
  users$ = this.usersService.users$;
  projects$ = this.usersService.projects$;

  searchTerm = '';
  usersFilterForm!: FormGroup;

  ngOnInit(): void {
    this.initializeFilters();

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
      projects: [''],
      hoursRange: ['200'],
      zeroHoursUsers: [true],
    });
  }

  onFilterChange(): void {
    const { searchTerm, projects, hoursRange, zeroHoursUsers } = this.usersFilterForm.value;
    this.usersService.filterUsers(searchTerm, projects, hoursRange, zeroHoursUsers);
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.usersService.getUsers().subscribe({
      next: () => {
        this.onFilterChange();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  exportToCSV(): void {
    this.usersService.exportUsersToCSV(this.users$());
  }
}
