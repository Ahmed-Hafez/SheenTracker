import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, Injector, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SquadsService } from '../../core/http/backend_service/squads.service';
import { RefreshService } from '../../core/services/refresh.service';
import { startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SquadFormDialogComponent } from "./components/squad-form-dialog/squad-form-dialog.component";
import { SquadsSkeletonComponent } from "./components/squads-skeleton/squads-skeleton.component";
import { SquadsTableComponent } from "./components/squads-table/squads-table.component";

@Component({
  selector: 'app-squads',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SquadsTableComponent,
    SquadFormDialogComponent,
    SquadsSkeletonComponent,
    SquadsTableComponent
],
  templateUrl: './squads.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SquadsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly squadsService = inject(SquadsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly refreshService = inject(RefreshService);
  private readonly injector = inject(Injector);

  searchTerm = '';
  squadsFilterForm!: FormGroup;

  readonly loading = signal(false);
  squads = this.squadsService.filteredSquads$;

  squadDialogVisible = signal(false);

  ngOnInit(): void {
    this.initializeFilters();

    this.squadsFilterForm.valueChanges
      .pipe(startWith(this.squadsFilterForm.getRawValue()), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onFilterChange());

    effect(
      () => {
        this.refreshService.refreshTick();
        this.loadSquads();
      },
      { injector: this.injector },
    );
  }

  initializeFilters(): void {
    this.squadsFilterForm = this.fb.group({
      searchTerm: [''],
    });
  }

  onFilterChange(): void {
    const { searchTerm } = this.squadsFilterForm.value;
    this.squadsService.filterSquads(searchTerm);
  }

  private loadSquads(): void {
    this.loading.set(true);
    this.squadsService.getSquads().subscribe({
      next: () => {
        this.onFilterChange();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onSquadDialogVisibleChange(visible: boolean): void {
    this.squadDialogVisible.set(visible);
  }

  showSquadDialog(): void {
    this.onSquadDialogVisibleChange(true);
  }
}
