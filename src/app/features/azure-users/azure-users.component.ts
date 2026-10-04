import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Injector,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { Checkbox } from 'primeng/checkbox';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SliderModule } from 'primeng/slider';
import { UsersService } from '../../core/http/backend_service/azure-users.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AzureUsersSkeletonComponent } from './components/azure-users-skeleton/azure-users-skeleton.component';
import { AzureUsersTableComponent } from './components/azure-users-table/azure-users-table.component';
import { RefreshService } from '../../core/services/refresh.service';
import { HolidayCalculatorComponent } from './components/holiday-calculator/holiday-calculator.component';
import { TargetHoursCardComponent } from './components/target-hours-card/target-hours-card.component';
import { DateService } from '../../core/services/date.service';
import {
  AzureUsersFilters,
  filtersFromParams,
  hoursRangeMax,
  paramsFromFilters,
  sameFilters,
} from './azure-users-filters';

@Component({
  selector: 'app-azure-users',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MultiSelectModule,
    ToggleSwitchModule,
    SliderModule,
    AzureUsersSkeletonComponent,
    AzureUsersTableComponent,
    HolidayCalculatorComponent,
    TargetHoursCardComponent,
  ],
  templateUrl: './azure-users.component.html',
})
export class AzureUsersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly refreshService = inject(RefreshService);
  private readonly injector = inject(Injector);
  private readonly dateService = inject(DateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  holidaysCalculatorVisible = signal(false);

  readonly loading = signal(true);
  users$ = this.usersService.users$;
  projects$ = this.usersService.projects$;

  tableChild = viewChild<AzureUsersTableComponent>('tableRef');

  readonly weekdaysCount$ = this.dateService.weekdaysCount;
  readonly holidaysCount$ = this.dateService.holidaysCount;

  searchTerm = '';
  usersFilterForm!: FormGroup;

  private readonly requestedHoursMax = signal(0);
  /** Slider upper bound: covers the largest logged total and any max carried by the URL. */
  readonly hoursMax = computed(() =>
    Math.max(
      hoursRangeMax((this.usersService.usersResponse$()?.users ?? []).map((u) => u.totalHours)),
      this.requestedHoursMax(),
    ),
  );

  ngOnInit(): void {
    this.initializeFilters();

    this.usersFilterForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.onFilterChange();
      this.syncUrl();
    });

    // The URL is the source of truth: links, back/forward and the sidebar all land here.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyUrlFilters());

    effect(
      () => {
        this.refreshService.refreshTick();
        this.loadUsers();
      },
      { injector: this.injector },
    );
  }

  initializeFilters(): void {
    const filters = filtersFromParams(this.route.snapshot.queryParamMap, this.hoursMax());
    this.requestedHoursMax.set(filters.hoursRange[1]);
    this.usersFilterForm = this.fb.group({
      searchTerm: [filters.searchTerm],
      projects: [filters.projects],
      hoursRange: [filters.hoursRange],
      zeroHoursUsers: [filters.zeroHoursUsers],
    });
  }

  onFilterChange(): void {
    const { searchTerm, projects, hoursRange, zeroHoursUsers } = this.usersFilterForm.value;
    this.usersService.filterUsers(searchTerm, projects, hoursRange, zeroHoursUsers);
    this.tableChild()?.resetToFirstPage();
  }

  private applyUrlFilters(): void {
    const fromUrl = filtersFromParams(this.route.snapshot.queryParamMap, this.hoursMax());
    this.requestedHoursMax.set(Math.max(this.requestedHoursMax(), fromUrl.hoursRange[1]));
    const current = this.usersFilterForm.getRawValue() as AzureUsersFilters;
    if (sameFilters(fromUrl, current)) return;

    this.usersFilterForm.patchValue(fromUrl, { emitEvent: false });
    this.onFilterChange();
  }

  private syncUrl(): void {
    const filters = this.usersFilterForm.getRawValue() as AzureUsersFilters;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: paramsFromFilters(filters, this.hoursMax()),
      replaceUrl: true,
    });
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.usersService.getAzureUsers().subscribe({
      next: () => {
        this.applyUrlFilters();
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
    // this.tableChild()?.azureUsersTable.;
  }

  showHolidayCalculatorPopup() {
    this.holidaysCalculatorVisible.set(true);
  }

  onDialogVisibleChange($event: boolean) {
    this.holidaysCalculatorVisible.set($event);
  }
}
