import { Component, ChangeDetectionStrategy, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { StatusBadgeComponent } from '../../../../shared/status-badge/status-badge.component';

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
  imports: [CommonModule, FormsModule, TableModule, AccordionModule, StatusBadgeComponent],
  templateUrl: './work-items-table.component.html',
  styles: ``,
})
export class WorkItemsTableComponent {
  groupedItems = input.required<ProjectGroup[]>();

  searchQuery = signal('');
  statusFilter = signal('All statuses');

  availableStatuses = computed(() => {
    const statuses = new Set<string>();
    for (const group of this.groupedItems()) {
      for (const item of group.items) {
        if (item.status) {
          statuses.add(item.status);
        }
      }
    }
    return Array.from(statuses).sort();
  });

  filteredGroups = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const selectedStatus = this.statusFilter();

    return this.groupedItems()
      .map((group) => {
        const filteredItems = group.items.filter((item) => {

          const matchesSearch =
            item.id.toLowerCase().includes(query) || item.title.toLowerCase().includes(query);
           var matchesStatus: Boolean = item.status === selectedStatus;
          if(selectedStatus === 'All statuses') {
            matchesStatus = true;
          }
          return matchesSearch && matchesStatus;
        });

        // Recalculate total hours for the filtered items
        const filteredHours = filteredItems.reduce((acc, item) => {
          // Parse deltaHours (e.g. "+7.0h" or "7.0h")
          const numericalPart = parseFloat(item.deltaHours.replace(/[^\d.-]/g, ''));
          return acc + (isNaN(numericalPart) ? 0 : Math.abs(numericalPart));
        }, 0);

        const mappedItems = filteredItems.map((item) => ({
          ...item,
          id: item.id.replace(/#/g, ''),
        }));

        return {
          ...group,
          items: mappedItems,
          totalWorkItems: mappedItems.length,
          totalHours: mappedItems.length > 0 ? filteredHours.toFixed(1) : '0.0',
        };
      })
      .filter((group) => group.items.length > 0);
  });
}
