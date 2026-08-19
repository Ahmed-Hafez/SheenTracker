import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MenuItem, TreeNode } from 'primeng/api';
import { TreeTableModule } from 'primeng/treetable';
import { BacklogItemUIModel } from './backlog-tree-node.model';
// Shared
import { StatCardComponent } from '../../shared/stat-card/stat-card.component';

// Models & Mock
import {
  ALL_EPICS_MOCK,
  ALL_EPICS_SUMMARY,
  BacklogItemApiModel,
} from '../../core/mock/all-epics.mock';

type FilterKey =
  | 'On Track'
  | 'At Risk'
  | 'Off Track'
  | 'Has Remaining'
  | 'Not Started'
  | 'Completed';

@Component({
  selector: 'app-quarter-plans-all-epics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BreadcrumbModule,
    InputTextModule,
    ButtonModule,
    SkeletonModule,
    IconFieldModule,
    InputIconModule,
    TableModule,
    TagModule,
    StatCardComponent,
    TreeTableModule,
  ],
  templateUrl: './quarter-plans-all-epics.component.html',
  styleUrl: './quarter-plans-all-epics.component.scss',
})
export class QuarterPlansAllEpicsComponent implements OnInit {
  // ── Breadcrumb ─────────────────────────────────────────────────────────────
  readonly breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Quarter Plans', routerLink: '/quarter-plans' },
    { label: 'All Epics' },
  ];

  // ── Loading ────────────────────────────────────────────────────────────────
  isLoading = signal(true);

  // ── Data ──────────────────────────────────────────────────────────────────
  readonly backlogResponse = ALL_EPICS_MOCK;
  BacklogTreeNodes!: TreeNode<BacklogItemUIModel>[];

  readonly summary = ALL_EPICS_SUMMARY;

  expandedRows: { [key: string]: boolean } = {};

  searchQuery = signal('');

  readonly filterOptions: FilterKey[] = [
    'On Track',
    'At Risk',
    'Off Track',
    'Has Remaining',
    'Not Started',
    'Completed',
  ];
  activeFilters = signal<Set<FilterKey>>(new Set());

  // ── Derived: filtered list ─────────────────────────────────────────────────
  filteredEpics = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const filters = this.activeFilters();

    // return this.allEpics.filter((epic) => {
    //   if (!epic.title.toLowerCase().includes(query)) {
    //     return false;
    //   }
    //   if (filters.size > 0) {
    //     const match =
    //       (filters.has('On Track')      && epic.status === 'On Track')  ||
    //       (filters.has('At Risk')        && epic.status === 'At Risk')   ||
    //       (filters.has('Off Track')      && epic.status === 'Off Track') ||
    //       (filters.has('Has Remaining')  && epic.remaining > 0)          ||
    //       (filters.has('Not Started')    && epic.completed === 0)        ||
    //       (filters.has('Completed')      && epic.remaining === 0);
    //     if (!match) return false;
    //   }
    //   return true;
    // });
  });

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading.set(false);
      this.initializeTreeNodes();
    }, 4000);
  }

  initializeTreeNodes(): void {
    const firstLevelInTree = 0;
    this.BacklogTreeNodes = this.backlogResponse.items.map((backlogApiItem) =>
      this.createTreeNode(backlogApiItem, firstLevelInTree),
    );
  }

  private createTreeNode(
    backlogApiItem: BacklogItemApiModel,
    levelNumber: number,
  ): TreeNode<BacklogItemUIModel> {
    const uiModel: BacklogItemUIModel = {
      data: backlogApiItem,
      color: this.getLevelColor(levelNumber),
      levelNumber: levelNumber,
      icon: this.getLevelIcon(levelNumber),
    };
    return {
      data: uiModel,
      children: uiModel.data.children?.map((child) => this.createTreeNode(child, levelNumber + 1)),
    };
  }

  /*

  <div class="color" style="background: #A855F7;">Purple</div>
<div class="color" style="background: #6366F1;">Indigo</div>
<div class="color" style="background: #06B6D4;">Cyan</div>
<div class="color" style="background: #EAB308;">Yellow</div>
  */
  private getLevelColor(levelNumber: number): string {
      switch (levelNumber) {
        case 0 :
          return '#A855F7'; // Purple
        case 1 :
          return '#6366F1'; // Indigo
        case 2 :
          return '#06B6D4'; // Cyan
        case 3 :
          return '#EAB308'; // Yellow
        default:
          return '#A90000'; // Default color for levels beyond 3
      }
  }
  /*
  "pi pi-bolt"
"pi pi-star"
"pi pi-user"
"pi pi-code"
"pi pi-comments"
"pi pi-check-square"


  */

private getLevelIcon(levelNumber: number): string {
  switch (levelNumber) {
    case 0:
      return 'pi pi-crown';
    case 1:
      return 'pi pi-star';
    case 2:
      return 'pi pi-book';
    case 3:
      return 'pi pi-code';
    default:
      return 'pi pi-comments'; // Default icon for levels beyond 3
  }
}

  toggleFilter(filter: FilterKey): void {
    this.activeFilters.update((current) => {
      const next = new Set(current);
      next.has(filter) ? next.delete(filter) : next.add(filter);
      return next;
    });
  }

  isFilterActive(filter: FilterKey): boolean {
    return this.activeFilters().has(filter);
  }

  // ── Expand / Collapse All ─────────────────────────────────────────────────
  expandAll(): void {
    // this.expandedRows = this.filteredEpics().reduce(
    //   (acc, epic) => ({ ...acc, [epic.id]: true }),
    //   {}
    // );
  }

  collapseAll(): void {
    this.expandedRows = {};
  }

  getSeverity(healthStatus: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (healthStatus) {
      case 'On Track':
        return 'success';
      case 'At Risk':
        return 'warn';
      case 'Off Track':
        return 'danger';
      default:
        return 'info';
    }
  }
}
