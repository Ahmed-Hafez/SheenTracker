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

  closedTasksCount = computed(() => this.data()?.completedTasksCount ?? 0);

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
    return tasks;
  });
}
