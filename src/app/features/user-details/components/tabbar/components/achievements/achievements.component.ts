import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { KpiCardComponent } from '../../../../../../shared/kpi-card/kpi-card.component';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule, TableModule, KpiCardComponent],
  templateUrl: './achievements.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementsComponent {
  data = input.required<any>();
}
