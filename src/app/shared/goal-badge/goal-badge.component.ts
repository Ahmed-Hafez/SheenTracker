// goal-status-badge.component.ts
import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'goal-status-badge',
  standalone: true,
  templateUrl: './goal-badge.component.html',
  styleUrl: './goal-badge.component.scss',
})
export class GoalStatusBadgeComponent {
  loggedHours = input.required<number>();
  targetHours = input.required<number>();

  isAchieved = computed(() => this.loggedHours() >= this.targetHours());

  delta = computed(() => this.loggedHours() - this.targetHours());

  formattedDelta = computed(() => {
    const d = this.delta();
    const sign = d >= 0 ? '+' : '';
    return `${sign}${d.toFixed(1)}h`;
  });
}
