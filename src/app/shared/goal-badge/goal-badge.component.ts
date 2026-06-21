// goal-status-badge.component.ts
import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'goal-status-badge',
  standalone: true,
  template: `
    <div class="badge-wrap">
      <span class="badge" [class.achieved]="isAchieved()" [class.missed]="!isAchieved()">
        <i [class]="isAchieved() ? 'pi pi-check' : 'pi pi-times'"></i>
        {{ isAchieved() ? 'Achieved' : 'Missed' }}
      </span>
      <span class="delta" [class.positive]="isAchieved()" [class.negative]="!isAchieved()">
        {{ formattedDelta() }}
      </span>
    </div>
  `,
  styles: [
    `
      .badge-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 500;
        border: 1.5px solid;
        white-space: nowrap;
      }
      .badge.achieved {
        background: #eaf3de;
        border-color: #639922;
        color: #27500a;
      }
      .badge.missed {
        background: transparent;
        border-color: red;
        color: red;
      }
      .delta {
        font-size: 14px;
        font-weight: 500;
      }
      .delta.positive {
        color: #3b6d11;
      }
      .delta.negative {
        color: red;
      }
    `,
  ],
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
