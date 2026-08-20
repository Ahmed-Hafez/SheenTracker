import { Component, OnInit, signal, computed, inject } from '@angular/core';
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
import { ALL_EPICS_SUMMARY } from '../../core/mock/all-epics.mock';
import { BacklogItemApiModel, AllEpicsResponse } from '../../core/models/reponse/backlog-response.model';
import { QuarterPlansAllEpicsService } from '../../core/http/backend_service/quarter-plans-all-epics.service';

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
  private readonly epicsService = inject(QuarterPlansAllEpicsService);
  // ── Breadcrumb ─────────────────────────────────────────────────────────────
  readonly breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Quarter Plans', routerLink: '/quarter-plans' },
    { label: 'All Epics' },
  ];

  // ── Loading ────────────────────────────────────────────────────────────────
  isLoading = signal(true);

  // ── Data ──────────────────────────────────────────────────────────────────
  backlogResponse: AllEpicsResponse | null = null;
  BacklogTreeNodes = signal<TreeNode<BacklogItemUIModel>[]>([]);

  readonly summary = ALL_EPICS_SUMMARY;

  first = signal(0);


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

  ngOnInit(): void {
    this.fetchEpics(1);
  }

  fetchEpics(pageNumber: number): void {
    this.isLoading.set(true);
    this.epicsService.getAllEpics(pageNumber).subscribe({
      next: (response) => {
        this.backlogResponse = response;
        this.initializeTreeNodes();
        this.isLoading.set(false);
      },
    });
  }

  onPage(event: any): void {
    this.first.set(event.first!);
    const calculatedPageNumber = event.first / event.rows + 1;
    this.fetchEpics(calculatedPageNumber);
  }

  initializeTreeNodes(): void {
    const firstLevelInTree = 0;
    if (this.backlogResponse) {
      this.BacklogTreeNodes.set(this.backlogResponse.items.map((backlogApiItem) =>
        this.createTreeNode(backlogApiItem, firstLevelInTree),
      ));
    }
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

  private getLevelColor(levelNumber: number): string {
    switch (levelNumber) {
      case 0:
        return '#A855F7'; // Purple
      case 1:
        return '#6366F1'; // Indigo
      case 2:
        return '#06B6D4'; // Cyan
      case 3:
        return '#EAB308'; // Yellow
      default:
        return '#A90000'; // Default color for levels beyond 3
    }
  }

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
        return ''; // Default icon for levels beyond 3
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

 expandAll(): void {
  this.BacklogTreeNodes.update(nodes => {
    this.setExpandedRecursively(nodes, true);
    return [...nodes];
  });
}

collapseAll(): void {
  this.BacklogTreeNodes.update(nodes => {
    this.setExpandedRecursively(nodes, false);
    return [...nodes];
  });
}

private setExpandedRecursively(
  nodes: TreeNode<BacklogItemUIModel>[],
  expanded: boolean
): void {
  for (const node of nodes) {
    node.expanded = expanded;

    if (node.children?.length) {
      this.setExpandedRecursively(node.children, expanded);
    }
  }
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
