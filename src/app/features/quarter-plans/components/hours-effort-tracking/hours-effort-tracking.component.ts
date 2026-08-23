import { Component, computed, inject, input } from '@angular/core';
import { QuarterPlansDashboardResponse } from '../../../../core/models/reponse/quarter-plans-dashboard.response';
import { StatCardComponent } from '../../../../shared/stat-card/stat-card.component';
import { QuarterPlansService } from '../../../../core/http/backend_service/quarter-plans.service';
import { EffortTrackingSkeletonComponent } from './effort-tracking-skeleton/effort-tracking-skeleton.component';
import { AnimateNumberDirective } from '../../../../core/directives/animate-number.directive';

@Component({
  selector: 'app-hours-effort-tracking',
  imports: [StatCardComponent, EffortTrackingSkeletonComponent, AnimateNumberDirective],
  templateUrl: './hours-effort-tracking.component.html',
  styleUrl: './hours-effort-tracking.component.scss',
})
export class HoursEffortTrackingComponent {
  private readonly qPlansService = inject(QuarterPlansService);

  readonly quarterPlans = this.qPlansService.qplansDashboardData;

  readonly isLoading = this.qPlansService.isLoading;
  readonly isError = this.qPlansService.isError;
  readonly isReady = computed(() => !this.isLoading() && !this.isError());
}
