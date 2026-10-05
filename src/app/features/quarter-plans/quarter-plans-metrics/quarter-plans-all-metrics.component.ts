import { Component, computed, DestroyRef, inject, Injector } from '@angular/core';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { MenuItem } from 'primeng/api';
import { QuarterPlansService } from '../../../core/http/backend_service/quarter-plans.service';
import { QuarterPlansDashboardResponse } from '../../../core/models/reponse/quarter-plans-dashboard.response';

type MetricFormat = 'count' | 'hours' | 'percent';

interface MetricDefinition {
  label: string;
  field: keyof QuarterPlansDashboardResponse;
  format: MetricFormat;
}

interface MetricGroup {
  title: string;
  metrics: MetricDefinition[];
}

@Component({
  selector: 'app-quarter-plans-all-metrics',
  standalone: true,
  imports: [DecimalPipe, NgTemplateOutlet, BreadcrumbModule, SkeletonModule, TableModule],
  templateUrl: './quarter-plans-all-metrics.component.html',
  styleUrl: './quarter-plans-all-metrics.component.scss',
})
export class QuarterPlansAllMetricsComponent {
  private readonly quarterPlansService = inject(QuarterPlansService);

  readonly breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Quarter Plans', routerLink: '/quarter-plans', queryParamsHandling: 'preserve' },
    { label: 'All Metrics' },
  ];

  readonly data = this.quarterPlansService.qplansDashboardData;
  readonly isLoading = this.quarterPlansService.isLoading;
  readonly isError = this.quarterPlansService.isError;

  readonly epicsByArea = computed(() => this.data()?.epicsByArea ?? []);
  readonly epicsByTaskType = computed(() => this.data()?.epicsByTaskType ?? []);

  readonly metricGroups: MetricGroup[] = [
    {
      title: 'Work Items',
      metrics: [
        { label: 'Epics', field: 'epicsCount', format: 'count' },
        { label: 'Features', field: 'featuresCount', format: 'count' },
        { label: 'Stories (User + Technical)', field: 'totalStoriesCount', format: 'count' },
        { label: 'User Stories', field: 'storiesCount', format: 'count' },
        { label: 'Technical User Stories', field: 'techStoryCount', format: 'count' },
        { label: 'Tasks', field: 'tasksCount', format: 'count' },
        { label: 'Bugs', field: 'bugsCount', format: 'count' },
        { label: 'Threads', field: 'threadCount', format: 'count' },
        { label: 'Support', field: 'supportCount', format: 'count' },
        { label: 'Test Cases', field: 'testCaseCount', format: 'count' },
        { label: 'Meetings', field: 'meetingsCount', format: 'count' },
      ],
    },
    {
      title: 'Hierarchy & Links',
      metrics: [
        { label: 'Story Children (Total Children)', field: 'totalChildrenCount', format: 'count' },
        { label: 'Children of Features', field: 'childrenOfFeaturesCount', format: 'count' },
        { label: 'Unlinked Epics', field: 'unlinkedEpicsCount', format: 'count' },
        { label: 'Unlinked Features', field: 'unlinkedFeaturesCount', format: 'count' },
      ],
    },
    {
      title: 'Execution Status',
      metrics: [
        { label: 'New', field: 'executionNewCount', format: 'count' },
        { label: 'Active', field: 'executionActiveCount', format: 'count' },
        { label: 'Closed', field: 'executionClosedCount', format: 'count' },
        { label: 'Execution Completion', field: 'executionCompletionPercent', format: 'percent' },
      ],
    },
    {
      title: 'Effort (Hours)',
      metrics: [
        { label: 'Total Effort', field: 'totalEffort', format: 'hours' },
        { label: 'Completed', field: 'totalCompleted', format: 'hours' },
        { label: 'Remaining', field: 'totalRemaining', format: 'hours' },
        { label: 'Closed Effort', field: 'closedEffort', format: 'hours' },
        { label: 'Effort Completion', field: 'completionPercentEffort', format: 'percent' },
      ],
    },
    {
      title: 'Story Points',
      metrics: [
        { label: 'Total Story Points', field: 'totalStoryPoints', format: 'count' },
        { label: 'Closed Story Points', field: 'closedStoryPoints', format: 'count' },
        { label: 'Story Points Completion', field: 'completionPercentSP', format: 'percent' },
      ],
    },
  ];

  constructor() {
    // Refetches whenever the quarter picked in the topbar changes.
    this.quarterPlansService.trackSelectedQuarter(inject(DestroyRef), inject(Injector));
  }

  valueOf(field: keyof QuarterPlansDashboardResponse): number | null {
    const value = this.data()?.[field];
    return typeof value === 'number' ? value : null;
  }
}
