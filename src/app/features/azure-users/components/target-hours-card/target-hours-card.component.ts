import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatCardData {
  icon: string;
  label: string;
  value: number;
  sub: string;
}

@Component({
  selector: 'app-target-hours-card',
  imports: [CommonModule],
  templateUrl: './target-hours-card.component.html',
  styleUrl: './target-hours-card.component.scss',
})
export class TargetHoursCardComponent {
  data = input.required<StatCardData>();
}
