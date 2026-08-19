import { computed, inject, Injectable, signal } from '@angular/core';
import { QuarterPlansDashboardResponse } from '../../models/reponse/quarter-plans-dashboard.response';
import { ApiService } from '../api_services/api.service';
import { QuarterYearService } from '../../services/quarter-year.service';
import { DateHelpers } from '../../utils/date-helpers';

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

  getQuarterPlansDashboardData() {
    return this.apiService.get<QuarterPlansDashboardResponse>(this.qPlansDashboardEndpoint);
  }

  readonly calendarElapsedPercent = computed(() => {
    const { start, end } = this.currentQuarter().dateRange;
    const today = DateHelpers.toDateOnly(new Date());
    const elapsedDays = Math.max(0, Math.round((today.getTime() - start.getTime()) / 86_400_000));
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000));

    return Math.ceil((elapsedDays / totalDays) * 100);
  });
}
