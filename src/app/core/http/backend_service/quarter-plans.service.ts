import { computed, inject, Injectable, signal } from '@angular/core';
import { QuarterPlansDashboardResponse } from '../../models/reponse/quarter-plans-dashboard.response';
import { ApiService } from '../api_services/api.service';
import { QuarterYearService } from '../../services/quarter-year.service';
import { DateHelpers } from '../../utils/date-helpers';
import { map, Observable } from 'rxjs';
import { AllEpicsResponse } from '../../models/reponse/backlog-response.model';

@Injectable({
  providedIn: 'root',
})
export class QuarterPlansService {
  qPlansDashboardEndpoint = 'dashboard';
  private readonly apiService = inject(ApiService);
  private readonly quarterDateService = inject(QuarterYearService);

  readonly currentQuarter = computed(() => this.quarterDateService.getCurrentQuarter());
  qplansDashboardData = signal<QuarterPlansDashboardResponse>({} as QuarterPlansDashboardResponse);
  isLoading = signal<boolean>(false);
  isError = signal<boolean>(false);

   private readonly allEpicsEndpoint = 'dashboard/hierarchy';


  getAllEpics(pageNumber: number): Observable<AllEpicsResponse> {
    return this.apiService.get<AllEpicsResponse>(`${this.allEpicsEndpoint}?pageNumber=${pageNumber}&pageSize=10`);
  }
  getQuarterPlansDashboardData() {
    return this.apiService.get<QuarterPlansDashboardResponse>(this.qPlansDashboardEndpoint).pipe(
      // Fix EpicsByArea name to remove "Enterprise Quarterly Planning\\" in the response data
      map((data) => {
        const fixedData: QuarterPlansDashboardResponse = {
          ...data,
          epicsByArea: data.epicsByArea.map((epic) => ({
            area: epic.area.replace('Enterprise Quarterly Planning\\', ''),
            total: epic.total,
            open: epic.open,
            closed: epic.closed,
          })),
        };
        return fixedData;
      }),
    );
  }

  readonly calendarElapsedPercent = computed(() => {
    const { start, end } = this.currentQuarter().dateRange;
    const today = DateHelpers.toDateOnly(new Date());
    const elapsedDays = Math.max(0, Math.round((today.getTime() - start.getTime()) / 86_400_000));
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000));

    return Math.ceil((elapsedDays / totalDays) * 100);
  });
}
