import { Component, ChangeDetectionStrategy, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { StatusBadgeComponent } from '../../../../shared/status-badge/status-badge.component';
import { Project } from '../../../../core/models/reponse/projects-hours.response.model';
import { ProjectDetail } from '../../../../core/models/reponse/azure-user-details/user-workItems.model';

@Component({
  selector: 'app-work-items-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TableModule, AccordionModule, StatusBadgeComponent],
  templateUrl: './work-items-table.component.html',
  styles: ``,
})
export class WorkItemsTableComponent {
  projects = input.required<ProjectDetail[]>();

  searchQuery = signal('');
  statusFilter = signal('All statuses');
  typeFilter = signal('All types');

  availableTypes = computed(() => {
    const types = new Set<string>();
    for (const project of this.projects()) {
      for (const item of project.workItems) {
        if (item.workItemType) {
          types.add(item.workItemType);
        }
      }
    }
    return Array.from(types).sort();
  });

  availableStatuses = computed(() => {
    const statuses = new Set<string>();
    for (const project of this.projects()) {
      for (const item of project.workItems) {
        if (item.state) {
          statuses.add(item.state);
        }
      }
    }
    return Array.from(statuses).sort();
  });

  filteredGroups = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const selectedStatus = this.statusFilter();

    return this.projects()
      .map((project) => {
        const filteredItems = project.workItems.filter((item) => {
          const matchesSearch =
            item.id.toString().toLowerCase().includes(query) ||
            item.title.toLowerCase().includes(query);
          var matchesStatus: Boolean = item.state === selectedStatus;
          if (selectedStatus === 'All statuses') {
            matchesStatus = true;
          }
          var matchesType: Boolean = item.workItemType === this.typeFilter();
          if (this.typeFilter() === 'All types') {
            matchesType = true;
          }
          return matchesSearch && matchesStatus && matchesType;
        });

        // Recalculate total hours for the filtered items
        const filteredHours = filteredItems.reduce((acc, item) => {
          // Parse deltaHours (e.g. "+7.0h" or "7.0h")
          const numericalPart = parseFloat(item.deltaHours.toString().replace(/[^\d.-]/g, ''));
          return acc + (isNaN(numericalPart) ? 0 : Math.abs(numericalPart));
        }, 0);

        const mappedItems = filteredItems.map((item) => ({
          ...item,
          id: item.id.toString().replace(/#/g, ''),
        }));

        return {
          ...project,
          items: mappedItems,
          totalWorkItems: mappedItems.length,
          totalHours: mappedItems.length > 0 ? filteredHours.toFixed(1) : '0.0',
        };
      })
      .filter((group) => group.items.length > 0);
  });
}
