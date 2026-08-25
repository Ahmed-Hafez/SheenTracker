// goal-status-badge.component.ts
import { Component, input, computed, inject } from '@angular/core';
import { User } from '../../core/models/reponse/azure-users.response.model';
import { UsersService } from '../../core/http/backend_service/azure-users.service';
import { DateService } from '../../core/services/date.service';

@Component({
  selector: 'goal-status-badge',
  standalone: true,
  templateUrl: './goal-badge.component.html',
  styleUrl: './goal-badge.component.scss',
})
export class GoalStatusBadgeComponent {
  private readonly userService = inject(UsersService);
  private readonly dateService = inject(DateService);
  loggedHours = computed(() => this.user().totalHours);
  targetHours = computed(() => {
    const workingDays = this.dateService.weekdaysCount()-this.dateService.holidaysCount();
    return this.userService.getExpectedHoursOrDefault(this.user(), workingDays);
  });
  user = input.required<User>();


  isAchieved = computed(() => this.loggedHours() >= this.targetHours());

  delta = computed(() => this.loggedHours() - this.targetHours());

  formattedDelta = computed(() => {
    const d = this.delta();
    const sign = d >= 0 ? '+' : '';
    return `${sign}${d.toFixed(1)}h`;
  });
}
