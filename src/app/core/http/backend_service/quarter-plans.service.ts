import { computed, DestroyRef, inject, Injectable, Injector, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { QuarterPlansDashboardResponse } from '../../models/reponse/quarter-plans-dashboard.response';
import { ApiService } from '../api_services/api.service';
import { QuarterYearService } from '../../services/quarter-year.service';
import { PlanQuarterService } from '../../services/plan-quarter.service';
import { DateHelpers } from '../../utils/date-helpers';
import { quarterDateRange } from '../../utils/plan-quarter';
import { PlanQuarter } from '../../models/reponse/plan-quarter.response';
import {
  catchError,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  Observable,
  switchMap,
  tap,
} from 'rxjs';
import { AllEpicsResponse } from '../../models/reponse/backlog-response.model';

export const EPICS_PAGE_SIZE = 10;

@Injectable({
  providedIn: 'root',
})
export class QuarterPlansService {
  qPlansDashboardEndpoint = 'dashboard';
  private readonly apiService = inject(ApiService);
  private readonly quarterDateService = inject(QuarterYearService);
  private readonly planQuarterService = inject(PlanQuarterService);

  readonly currentQuarter = computed(() => this.quarterDateService.getCurrentQuarter());
  qplansDashboardData = signal<QuarterPlansDashboardResponse>({} as QuarterPlansDashboardResponse);
  isLoading = signal<boolean>(false);
  isError = signal<boolean>(false);

  private readonly allEpicsEndpoint = 'dashboard/hierarchy';

  getAllEpics(pageNumber: number, quarter: string | null): Observable<AllEpicsResponse> {
    return this.apiService.get<AllEpicsResponse>(
      withQuarter(
        `${this.allEpicsEndpoint}?pageNumber=${pageNumber}&pageSize=${EPICS_PAGE_SIZE}`,
        quarter,
      ),
    );
  }

  getQuarterPlansDashboardData(quarter: string | null) {
    return this.apiService
      .get<QuarterPlansDashboardResponse>(withQuarter(this.qPlansDashboardEndpoint, quarter))
      .pipe(
        // Fix EpicsByArea name to remove "Enterprise Quarterly Planning\\" in the response data
        map((data) => {
          const fixedData: QuarterPlansDashboardResponse = {
            ...data,
            epicsByArea: data.epicsByArea.map((epic) => ({
              area: epic.area.replace('Enterprise Quarterly Planning\\', ''),
              total: epic.total,
              notStarted: epic.notStarted,
              inProgress: epic.inProgress,
              closed: epic.closed,
              completionPercent: epic.completionPercent,
            })),
            epicsByTaskType: data.epicsByTaskType.map((epic) => ({
              taskType: epic.taskType,
              total: epic.total,
              notStarted: epic.notStarted,
              inProgress: epic.inProgress,
              closed: epic.closed,
              completionPercent: epic.completionPercent,
            })),
          };
          return fixedData;
        }),
      );
  }

  /**
   * Keeps `qplansDashboardData` on the selected quarter until `destroyRef` fires.
   * A new selection unsubscribes from the previous request (aborting it), so a slow
   * response for the old quarter can never overwrite the new one.
   */
  trackSelectedQuarter(destroyRef: DestroyRef, injector: Injector): void {
    this.planQuarterService.load();
    selectedQuarterChanges(this.planQuarterService, injector)
      .pipe(
        tap(() => {
          this.isLoading.set(true);
          this.isError.set(false);
        }),
        switchMap((quarter) =>
          this.getQuarterPlansDashboardData(quarter?.name ?? null).pipe(
            catchError((error: unknown) => {
              // The default quarter's request takes over and keeps the loading state.
              if (isUnknownQuarter(error, quarter) && this.planQuarterService.resetToDefault()) {
                return EMPTY;
              }
              // Don't leave the previous quarter's numbers on screen.
              this.qplansDashboardData.set({} as QuarterPlansDashboardResponse);
              this.isLoading.set(false);
              this.isError.set(true);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe((data) => {
        this.qplansDashboardData.set(data);
        this.isLoading.set(false);
      });
  }

  /** Days of the shown quarter that have passed, 0–100. */
  readonly calendarElapsedPercent = computed(() => {
    const quarter = this.qplansDashboardData().quarter ?? this.planQuarterService.selected();
    const { start, end } = quarter ? quarterDateRange(quarter) : this.currentQuarter().dateRange;
    const today = DateHelpers.toDateOnly(new Date());
    const elapsedDays = Math.max(0, Math.round((today.getTime() - start.getTime()) / 86_400_000));
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000));

    return Math.min(100, Math.ceil((elapsedDays / totalDays) * 100));
  });
}

/**
 * Emits the selected quarter once the list has loaded, then on every change.
 * `null` means there are no quarters, so requests go out unfiltered.
 */
export function selectedQuarterChanges(
  planQuarterService: PlanQuarterService,
  injector: Injector,
): Observable<PlanQuarter | null> {
  return toObservable(planQuarterService.selected, { injector }).pipe(
    filter((quarter): quarter is PlanQuarter | null => quarter !== undefined),
    distinctUntilChanged((a, b) => a?.name === b?.name),
  );
}

/** A 404 for a filtered request means the backend doesn't know that quarter name. */
export function isUnknownQuarter(error: unknown, quarter: PlanQuarter | null): boolean {
  return quarter !== null && error instanceof HttpErrorResponse && error.status === 404;
}

function withQuarter(url: string, quarter: string | null): string {
  if (!quarter) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}quarter=${encodeURIComponent(quarter)}`;
}
