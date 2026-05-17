import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';

export interface WorkItem {
  id: string;
  title: string;
  type: string;
  status: string;
  deltaHours: string;
  before: string;
  atEnd: string;
  snapshot: string;
  isPositiveDelta?: boolean;
}

export interface ProjectGroup {
  projectName: string;
  totalWorkItems: number;
  totalHours: string;
  items: WorkItem[];
}

@Component({
  selector: 'app-work-items-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TableModule],
  templateUrl: './work-items-table.component.html',
  styles: ``,
})
export class WorkItemsTableComponent {
  groupedItems = input.required<ProjectGroup[]>();
}
