import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { KpiCardComponent } from '../../../../../../shared/kpi-card/kpi-card.component';
import { AchievementResponse } from '../../../../../../core/models/reponse/achievemetsResponse.model';

import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule, TableModule, KpiCardComponent, Skeleton],
  templateUrl: './achievements.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementsComponent {
  data = input.required<AchievementResponse | null>();
  isLoading = input<boolean>(false);

  closedTasks = computed(() => this.data()?.completedTasksCount ?? 0);

  totalClosedHours = computed(() => {
    const hours = this.data()?.totalCompletedWorkHours ?? 0;
    return `${hours}h`;
  });

  projectsTouched = computed(() => {
    const tasks = this.data()?.tasks || [];
    return new Set(tasks.map((t) => t.projectName)).size;
  });

  items = computed(() => {
    const tasks = this.data()?.tasks || [];
    return tasks.map((task) => {
      const delta = task.completedWorkHours - task.originalEstimateHours;
      const isPositiveDelta = delta <= 0;
      const sign = delta > 0 ? '+' : '';
      return {
        id: `#${task.workItemId}`,
        urlId: task.workItemId,
        title: task.title,
        type: 'Task',
        project: task.projectName,
        deltaHours: `${sign}${delta.toFixed(1)}h`,
        finalHours: `${task.completedWorkHours}h`,
        closedOn: task.completedAt ? task.completedAt.split('T')[0] : '',
        isPositiveDelta,
      };
    });
  });
}
