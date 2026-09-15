import { Component, computed, inject } from '@angular/core';
import { TaskTypeComponent } from './task-type/task-type.component';
import { Router } from '@angular/router';
import { EpicsByTaskTypeSkeletonComponent } from './epics-by-task-type-skeleton/epics-by-task-type-skeleton.component';
import { QuarterPlansService } from '../../../../../core/http/backend_service/quarter-plans.service';

@Component({
  selector: 'app-epics-by-task-type',
  imports: [TaskTypeComponent, EpicsByTaskTypeSkeletonComponent],
  templateUrl: './epics-by-task-type.component.html',
  styleUrl: './epics-by-task-type.component.scss',
})
export class EpicsByTaskTypeComponent {
  constructor(private router: Router) {}

  navigateToAllEpics() {
    this.router.navigate(['/quarter-plans/all-epics']);
  }

  private readonly qPlansService = inject(QuarterPlansService);
  readonly isLoading = this.qPlansService.isLoading;

  epicsByTaskType = computed(() => this.qPlansService.qplansDashboardData().epicsByTaskType);
}
