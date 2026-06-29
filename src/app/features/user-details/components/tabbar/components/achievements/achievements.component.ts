import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { KpiCardComponent } from '../../../../../../shared/kpi-card/kpi-card.component';
import {
  Achievements,
  AchievementTasks,
} from '../../../../../../core/models/reponse/azure-user-details/user-achievemets.model';

import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule, TableModule, KpiCardComponent],
  templateUrl: './achievements.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementsComponent {
  achievements = input.required<Achievements | null>();

  closedTasksCount = computed(() => this.achievements()?.completedTasksCount ?? 0);

  totalClosedHours = computed(() => {
    const hours = this.achievements()?.totalCompletedWorkHours?.toFixed(1) ?? 0;
    return `${hours}h`;
  });

  projectsTouched = computed(() => {
    const tasks = this.achievements()?.tasks ?? [];
    return new Set(tasks.map((task: AchievementTasks) => task.projectName)).size;
  });

  items = computed(() => {
    const tasks = this.achievements()?.tasks || [];
    return tasks;
  });
}
