import { Component, computed, inject } from '@angular/core';
import { AnimateNumberDirective } from '../../../../../core/directives/animate-number.directive';
import { QuarterPlansService } from '../../../../../core/http/backend_service/quarter-plans.service';
import { StatCardComponent } from '../../../../../shared/stat-card/stat-card.component';
import { EffortTrackingSkeletonComponent } from './effort-tracking-skeleton/effort-tracking-skeleton.component';


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
